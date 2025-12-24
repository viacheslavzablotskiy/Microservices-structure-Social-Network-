import { BadRequestException, Inject, Injectable, NotAcceptableException, OnModuleDestroy, OnModuleInit, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CommentEnity_Proto, Post_Enitity_Proto } from "@repo/user-interfaces";
import { CommentEnity } from "src/entitis/comment.entity";
import { Repository } from "typeorm";
import {Empty} from 'google-protobuf/google/protobuf/empty_pb'
import { convertDateToTimeStamp } from "@repo/proto";
import * as amqp from 'amqplib'
import {ConnectionService} from '@repo/rabbitmq-package'
import { ConfigService } from "@nestjs/config";
import { CacheService } from "@repo/chache-package";


const ROUTING_KEY = {
    DELETE_POST_PAGE: 'POST_PAGE_CACHE_ROUTING_KEY',
    DELETE_COMMENT_PAGE: 'COMMENT_DEL_PAGE_ROUTING_KEY',
    DELETE_COUNT_COMMENT: 'COMMENT_DEL_COUNT_KEY'
} as const
type RoutingKeys = keyof typeof ROUTING_KEY
type ROUTING_KEYS_PAYLOAD = {
    DELETE_POST_PAGE: '',
    DELETE_COMMENT_PAGE: {postId: number},
    DELETE_COUNT_COMMENT: {postId: number},
}
type Payload<K extends RoutingKeys> = ROUTING_KEYS_PAYLOAD[K]

@Injectable()
export class CrudCommentService implements OnModuleInit, OnModuleDestroy {
    private channel: amqp.ConfirmChannel
    private exchangeName: string
    private routingsKeys: Record<RoutingKeys, string>
    private postPageKeyRedis: string

    constructor(
        @InjectRepository(CommentEnity) private readonly repositoryComment: Repository<CommentEnity>,
        private readonly configService: ConfigService,
        private readonly connectionService: ConnectionService,
        private readonly cacheService: CacheService
    ) {}

    async onModuleInit() {
        const conn = await this.connectionService.getConnection()
        this.channel = await conn.createConfirmChannel()

        this.exchangeName = this.configService.get<string>('CACHE_EXCHANGE') || ''
        this.postPageKeyRedis = this.configService.get<string>('CACHE_KEY_POST_PAGE1') || ''

        this.routingsKeys = {
            DELETE_POST_PAGE: this.configService.get<string>('POST_PAGE_CACHE_ROUTING_KEY') || '',
            DELETE_COMMENT_PAGE: this.configService.get<string>('COMMENT_DEL_PAGE_ROUTING_KEY') || '',
            DELETE_COUNT_COMMENT: this.configService.get<string>('COMMENT_DEL_COUNT_KEY') || ''
        }
    }

    async safePublish<K extends RoutingKeys>(routingKey: K, payload: Payload<K>) {
        try {
            await this.connectionService.publish(this.channel, this.exchangeName, this.routingsKeys[routingKey], payload)
        } catch (error) {
            throw new Error('error occured by this reason: ', error)
        }
    }


    async createNewComment(data: Omit<CommentEnity_Proto, 'createdAt' | 'updatedAt' | 'id'>): Promise<CommentEnity_Proto> {
        try {
            console.log(data);
            
            const creationData = this.repositoryComment.create({
            userId: data.userId,
            postId: data.postId,
            content: data.content
            })

            const response = await this.repositoryComment.save(creationData)

            const posts = await this.cacheService.get<Post_Enitity_Proto[]>(this.postPageKeyRedis)
            const inFirstPage = posts?.some((post) => {return post.id === response.postId}) ?? false

            const task = [
                this.safePublish('DELETE_COMMENT_PAGE', {postId: response.postId}),
                this.safePublish('DELETE_COUNT_COMMENT', {postId: response.postId}),
            ]
            if (inFirstPage) task.push(this.safePublish('DELETE_POST_PAGE', ''))
            
            const result = await Promise.allSettled(task)
            result.forEach((task) => {
                if (task.status === 'rejected') console.error(task.reason)
           })

            return {
            ...response,
            createdAt: convertDateToTimeStamp(response.createdAt),
            updatedAt: convertDateToTimeStamp(response.updatedAt)
            }
        } catch (error) {
            if (error.code === '23505') {
                throw new BadRequestException('there is soem comment with this data')
            }
            throw error
        }
    }
    
    async updateComment(data: Pick<CommentEnity_Proto, 'content' | 'id' | 'userId' >): Promise<CommentEnity_Proto> {
        
        const response = await this.repositoryComment.update(
            {id: data.id, userId: data.userId},
            {content: data.content}
        )

        if (response.affected === 0) {
            throw new BadRequestException('no comment fount with this id for update')   
        }

        const updated_data = await this.repositoryComment.findOneBy({
            id: data.id
        })

        return {
            ...updated_data!,
            createdAt: convertDateToTimeStamp(updated_data!.createdAt),
            updatedAt: convertDateToTimeStamp(updated_data!.updatedAt)
        }
    }

    async deleteComment(data: {id: number, userId: number, postId: number}): Promise<Empty> {
        console.log(data);
        
        try {
            const response = await this.repositoryComment.delete({id: data.id, userId: data.userId})

            if (response.affected === 0) {
                throw new BadRequestException('there was not comment with that id')
            }

            const posts = await this.cacheService.get<Post_Enitity_Proto[]>(this.postPageKeyRedis)
            const inFirstPage = posts?.some((post) => {return post.id === data.postId}) ?? false 
            const tasks = [
                this.safePublish('DELETE_COMMENT_PAGE', {postId: data.postId}),
                this.safePublish('DELETE_COUNT_COMMENT', {postId: data.id}),
            ]
            if (inFirstPage) tasks.push(this.safePublish('DELETE_POST_PAGE', ''))

            const result = await Promise.allSettled(tasks)
            result.forEach((task) => {
                if (task.status === 'rejected') console.error(task.reason)
            })

            return new Empty()

        } catch (error) {
            console.error(error);
            throw error
        }
    }


    async onModuleDestroy() {
        if (this.channel) {
            await this.channel.close()
        }
    }
}