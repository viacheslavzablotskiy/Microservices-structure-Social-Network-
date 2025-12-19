import { BadRequestException, Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PostEntity } from "src/entities/post.entity";
import {CretionNewPost, Post_Enitity_Proto} from '@repo/user-interfaces'
import { Repository, WriteError } from "typeorm";
import convertFromPostToProto from "src/utils/convertToProto";
import { Empty } from "google-protobuf/google/protobuf/empty_pb";
import {ConnectionService} from '@repo/rabbitmq-package'
import * as amqp from 'amqplib'
import { ConfigService } from "@nestjs/config";
import { CacheService } from "@repo/chache-package";


const ROUTING_KEY = {
    COMMENT_DEL_PAGE: 'COMMENT_DEL_PAGE_ROUTING_KEY',
    COMMENT_DEL_COUNT: 'COMMENT_DEL_COUNT_KEY',
    DELETE_COMMENTS: 'DELETE_COMMENT_KEY',
    LIKE_COUNT: 'LIKE_COUNT_ROUTING_KEY',
    POST_PAGE_CACHE: 'POST_PAGE_CACHE_ROUTING_KEY'
} as const

type RoutingKeyValues = keyof typeof ROUTING_KEY

type PayloadMap = {
    COMMENT_DEL_PAGE: {postId: number},
    COMMENT_DEL_COUNT: {postId: number},
    DELETE_COMMENTS: {postId: number},
    LIKE_COUNT: {postId: number},
    POST_PAGE_CACHE: ''
}
type Payload<T extends RoutingKeyValues> = PayloadMap[T]


@Injectable()
export class CrudService implements OnModuleInit, OnModuleDestroy{
    private channel: amqp.ConfirmChannel
    private exchangeName: string
    private cacheKeyPostPage: string
    
    private routingKeys: Record<keyof typeof ROUTING_KEY, string>

    constructor(
        @InjectRepository(PostEntity)
        private readonly repositoryPost: Repository<PostEntity>,
        private readonly configService: ConfigService,
        private readonly connectionService: ConnectionService,
        private readonly cacheServie: CacheService
    ) {}


    async onModuleInit() {
        const conn = await this.connectionService.getConnection()
        this.channel = await conn.createConfirmChannel()
        //common exchange for cache
        this.exchangeName = this.configService.get<string>('CACHE_EXCHANGE') || ''
        //cache key for first page of the posts
        this.cacheKeyPostPage = this.configService.get<string>('CACHE_KEY_POST_PAGE1') || ''
        // routings keys for send to RabbitMQ
        this.routingKeys = {
            COMMENT_DEL_PAGE: this.configService.get<string>('COMMENT_DEL_PAGE_ROUTING_KEY') || '',
            COMMENT_DEL_COUNT: this.configService.get<string>('COMMENT_DEL_COUNT_KEY') || '',
            DELETE_COMMENTS: this.configService.get<string>('DELETE_COMMENT_KEY') || '',
            LIKE_COUNT: this.configService.get<string>('LIKE_COUNT_ROUTING_KEY') || '',
            POST_PAGE_CACHE: this.configService.get<string>('POST_PAGE_CACHE_ROUTING_KEY') || ''
        }

        const missing = [
            ['exchangeName', this.exchangeName],
            ['cacheKeyPostPage', this.cacheKeyPostPage],
            ...Object.entries(this.routingKeys)
        ].filter(([,data]) => !data)

        if (missing.length) {
            console.error('Missing values:', missing.map(([values]) => values).join(' '));
            throw new Error('Invalidate configuration for initilization')
        }
    }

    private async safePublish<K extends keyof PayloadMap>(routingKey: K, payload: Payload<K>) {
        try {
            await this.connectionService.publish(
                this.channel, this.exchangeName, this.routingKeys[routingKey], payload
            )
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    async handleNewPost(data: CretionNewPost): Promise<Post_Enitity_Proto> {
        try {
            const creationData = this.repositoryPost.create({
            userId: data.userId,
            title: data.title,
            imageUrl: data.imageUrl,
            content: data.content
            })

            const response = await this.repositoryPost.save(creationData)

            await this.safePublish('POST_PAGE_CACHE', '')

            return convertFromPostToProto(response)
        } catch (error) {
            console.error(error);
            if (error.code === '203505') {
                throw new BadRequestException('there already we have this post with that data')
            }
            throw error
        }
    }

    async updatePost(data: Partial<Omit<Post_Enitity_Proto, 'createdAt' | 'updatedAt' | 'id' | 'userId'>>
        & Pick<Post_Enitity_Proto, 'id' | 'userId'>
    ): Promise<Post_Enitity_Proto> {

        const {id, userId, ...otherData} = data
        const post = await this.repositoryPost.preload({
            id: data.id, ...otherData
        })

        if (post === undefined || post.userId !== userId) {
            throw new BadRequestException('you are not author or invalid data')
        }

        const result = await this.repositoryPost.save(post)

        return  convertFromPostToProto(result)
    }

    async deletePost(data: {id: number, userId: number}): Promise<Empty> {

        try {
            const action = await this.repositoryPost.delete({
                id: data.id, userId: data.userId
            })

            if (action.affected === 0) {
                throw new BadRequestException('there is no any post with that id to delete')
            }
            const cacheFirstPage = await this.cacheServie.get<Post_Enitity_Proto[]>(this.cacheKeyPostPage)
            if (!cacheFirstPage) return new Empty()

            const setOfPostIds = new Set(cacheFirstPage.map(post => post.id))
            if (setOfPostIds.has(data.id)) {
                const tasks = [
                    this.safePublish('COMMENT_DEL_PAGE', {postId: data.id}),
                    this.safePublish('COMMENT_DEL_COUNT', {postId: data.id}),
                    this.safePublish('DELETE_COMMENTS', {postId: data.id}),
                    this.safePublish('LIKE_COUNT', {postId: data.id}),
                    this.safePublish('POST_PAGE_CACHE', '')
                ]
                const result = await Promise.allSettled(tasks)
                result.forEach(task => {
                    if (task.status === 'rejected') console.error(task.reason)                    
                });
            }
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