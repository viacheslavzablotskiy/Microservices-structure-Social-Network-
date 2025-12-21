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

        const dlxEchange = this.configService.get<string>('DLX_EXCHANGE') || ''
        const dlxQueue = this.configService.get<string>('DLX_QUEUE') || ''
        const dlxRoutingKey = this.configService.get<string>('DLX_ROUTING_KEY') || '' 

        const cacheExchange = this.configService.get<string>('CACHE_EXCHANGE') || ''
        const commentCountQueue = this.configService.get<string>('COMMENT_DEL_COUNT_QUEUE') || ''
        const commentCountKey = this.configService.get<string>('COMMENT_DEL_COUNT_KEY') || ''
        const commentPageQueue = this.configService.get<string>('COMMENT_DEL_PAGE_QUEUE') || ''
        const commentPageKey = this.configService.get<string>('COMMENT_DEL_PAGE_ROUTING_KEY') || ''

        const config: [string, string][] = [
            ['DLX_EXCHANGE', dlxEchange],
            ['DLX_QUEUE', dlxQueue],
            ['DLX_ROUTING_KEY', dlxRoutingKey],
            ['CACHE_EXCHANGE', cacheExchange],
            ['COMMENT_DEL_COUNT_QUEUE', commentCountQueue],
            ['COMMENT_DEL_COUNT_KEY', commentCountKey],
            ['COMMENT_DEL_PAGE_QUEUE', commentPageQueue],
            ['COMMENT_DEL_PAGE_ROUTING_KEY', commentPageKey]
        ]
        const missing = config.filter(([, value]) => !value);
        if (missing.length) {
            const names = missing.map(([missing_value]) => missing_value).join(', ')
            throw new Error(`Invalid configuration: you missing or invalid this data: ${names}`)
        }

        await Promise.all([
            this.connectionService.initDLX( this.channel, dlxEchange, dlxQueue, dlxRoutingKey),
            this.connectionService.initQueue(this.channel, cacheExchange, commentCountQueue, commentCountKey, dlxEchange, dlxRoutingKey),
            this.connectionService.initQueue(this.channel, cacheExchange, commentPageQueue, commentPageKey, dlxEchange, dlxRoutingKey)
        ])

        this.channel.prefetch(10) 


        await this.channel.consume(commentCountQueue, async (consumeMessage) => {
            if (!consumeMessage) return
            const payload: {postId: number} = JSON.parse(consumeMessage.content.toString())
            try {
                console.log('comment_cache: ', payload);
                await this.delCommentCountCache(payload.postId)
                this.channel.ack(consumeMessage)
            } catch (error) {
                console.error(error)
                this.channel.nack(consumeMessage, false, false)
            }
        })

        await this.channel.consume(commentPageQueue, async (consumeMessage) => {
            if (!consumeMessage) return
            const payload: {postId: number} = JSON.parse(consumeMessage.content.toString())
            try {
                await this.delCommentPageCache(payload.postId)
                this.channel.ack(consumeMessage)
            } catch (error) {
                console.error(error)
                this.channel.nack(consumeMessage, false, false)
            } 
        }, {noAck: false})
    }


    async delCommentCountCache(postId: number): Promise<void> {
        const cacheKey = `comments:post:${postId}:count`
        console.log(cacheKey);
        await this.cacheSerivce.del(cacheKey) 
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