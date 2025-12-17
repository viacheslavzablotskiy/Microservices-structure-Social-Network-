import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { CacheService } from "@repo/chache-package";
import {ConnectionService} from '@repo/rabbitmq-package'
import {ConfigService} from '@nestjs/config'
import * as amqp from 'amqplib'

@Injectable()
export class InvalidateCommentService implements OnModuleInit, OnModuleDestroy{
    private channel: amqp.Channel

    constructor(
        private readonly cacheSerivce: CacheService,
        private readonly configService: ConfigService,
        private readonly connectionService: ConnectionService
    ) {}

    async onModuleInit() {
        const conn = await this.connectionService.getConnection()
        this.channel = await conn.createChannel()

        await this.connectionService.initDLX(
        this.channel, this.configService.get<string>('DLX_EXCHANGE') || '', this.configService.get<string>('DLX_QUEUE') || '',
        this.configService.get<string>('DLX_ROUTING_KEY') || '' 
        )

        await this.connectionService.initQueue(
        this.channel, this.configService.get<string>('COMMENT_DEL_COUNT_EXCHANGE') || '', this.configService.get<string>('COMMENT_DEL_COUNT_QUEUE') || '',
        this.configService.get<string>('COMMENT_DEL_COUNT_KEY') || '', this.configService.get<string>('DLX_EXCHANGE') || '',
        this.configService.get<string>('DLX_ROUTING_KEY') || ''
        )

        await this.connectionService.initQueue(
        this.channel, this.configService.get<string>('COMMENT_DEL_PAGE_EXCHANGE') || '', this.configService.get<string>('COMMENT_DEL_PAGE_QUEUE') || '',
        this.configService.get<string>('COMMENT_DEL_PAGE_ROUTING_KEY') || '', this.configService.get<string>('DLX_EXCHANGE') || '',
        this.configService.get<string>('DLX_ROUTING_KEY') || ''
        )

        await this.channel.consume(this.configService.get<string>('COMMENT_DEL_COUNT_QUEUE') || '', async (consumeMessage) => {
            if (!consumeMessage) return
            const payload: {postId: number} = JSON.parse(consumeMessage.content.toString())
            try {
                await this.delCommentCountCache(payload.postId)
                this.channel.ack(consumeMessage)
            } catch (error) {
                this.channel.nack(consumeMessage, false, false)
            }
        })

        await this.channel.consume(this.configService.get<string>('COMMENT_DEL_PAGE_QUEUE') || '', async (consumeMessage) => {
            if (!consumeMessage) return
            const payload: {postId: number} = JSON.parse(consumeMessage.content.toString())
            try {
                await this.delCommentPageCache(payload.postId)
                this.channel.ack(consumeMessage)
            } catch (error) {
                this.channel.nack(consumeMessage, false, false)
            } 
        }, {noAck: false})
    }


    async delCommentCountCache(postId: number): Promise<void> {
    await this.cacheSerivce.del(`comments:post:${postId}:count`) //!!!!!!!!!1 change ths cacheKey in the comment-service
    }

    async delCommentPageCache(postId: number): Promise<void> {
        await this.cacheSerivce.del(`comments:post:${postId}:page:1`)
    }

    async onModuleDestroy() {
        if (this.channel) {
            await this.channel.close()
        }
    }
}