import { BadRequestException, Inject, Injectable, NotAcceptableException, OnModuleDestroy, OnModuleInit, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CommentEnity_Proto } from "@repo/user-interfaces";
import { CommentEnity } from "src/entitis/comment.entity";
import { Repository } from "typeorm";
import {Empty} from 'google-protobuf/google/protobuf/empty_pb'
import { convertDateToTimeStamp } from "@repo/proto";
import * as amqp from 'amqplib'
import {ConnectionService} from '@repo/rabbitmq-package'
import { ConfigService } from "@nestjs/config";

@Injectable()
export class CrudCommentService implements OnModuleInit, OnModuleDestroy {
    private channel: amqp.ConfirmChannel

    constructor(@InjectRepository(
        CommentEnity) private readonly repositoryComment: Repository<CommentEnity>,
        private readonly configService: ConfigService,
        private readonly connectionService: ConnectionService
    ) {}

    async onModuleInit() {
        const conn = await this.connectionService.getConnection()
        this.channel = await conn.createConfirmChannel()
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
            
            await this.connectionService.publish(this.channel,
                this.configService.get<string>('CACHE_EXCHANGE') || '',
                this.configService.get<string>('COMMENT_DEL_PAGE_ROUTING_KEY') || '',
                {postId: response.postId}
            ).catch((error) => console.error(error))

            await this.connectionService.publish(this.channel,
                this.configService.get<string>('CACHE_EXCHANGE') || '',
                this.configService.get<string>('COMMENT_DEL_COUNT_KEY') || '',
                {postId: response.postId}
            ).catch(error => console.error(error))

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

            await this.connectionService.publish(this.channel,
            this.configService.get<string>('CACHE_EXCHANGE') || '',
            this.configService.get<string>('COMMENT_DEL_PAGE_ROUTING_KEY') || '',
            {postId: data.postId})
            await this.connectionService.publish(this.channel,
            this.configService.get<string>('CACHE_EXCHANGE') || '',
            this.configService.get<string>('COMMENT_DEL_COUNT_KEY') || '',
            {postId: data.postId})

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