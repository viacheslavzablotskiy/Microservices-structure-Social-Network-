import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import * as amqp from 'amqplib'
import {CacheService} from '@repo/chache-package'
import {ConfigService} from '@nestjs/config'
import {ConnectionService} from '@repo/rabbitmq-package'

@Injectable()
export class InvalidatePostService implements OnModuleInit, OnModuleDestroy {
    private channel: amqp.Channel

    constructor(
        private readonly cacheService: CacheService,
        private readonly configService: ConfigService,
        private readonly connectionService: ConnectionService,
        private readonly logger: Logger
    ) {}

    async onModuleInit() {
        const conn = await this.connectionService.getConnection()
        this.channel = await conn.createChannel()

        const cacheExchange = this.configService.get<string>('CACHE_EXCHANGE') || ''
        const dlxEchange = this.configService.get<string>('DLX_EXCHANGE') || ''
        const dlxRoutingKey = this.configService.get<string>('DLX_ROUTING_KEY') || ''
        const dlxQueue = this.configService.get<string>('DLX_QUEUE') || ''
        const postPageQueue = this.configService.get<string>('POST_PAGE_CACHE_QUEUE') || ''
        const postPageKey = this.configService.get<string>('POST_PAGE_CACHE_ROUTING_KEY') || ''

        const config: [string, string][] = [
            ['DLX_EXCHANGE', dlxEchange],
            ['DLX_QUEUE', dlxQueue],
            ['DLX_ROUTING_KEY', dlxRoutingKey],
            ['CACHE_EXCHANGE', cacheExchange],
            ['POST_PAGE_CACHE_QUEUE', postPageQueue],
            ['POST_PAGE_CACHE_ROUTING_KEY', postPageKey]
        ]

        const missing = config.filter(([, value]) => {!value})

        if (missing.length) {
            const missingValues = missing.map(([value]) => value).join(', ')
            throw new Error(`you dont have whole confoguration like: ${missingValues}`)
        }

        await this.connectionService.initDLX(this.channel, dlxEchange, dlxQueue,dlxRoutingKey),
        await this.connectionService.initQueue(this.channel, cacheExchange, postPageQueue,postPageKey, dlxEchange, dlxRoutingKey)

        this.channel.consume(this.configService.get<string>('POST_PAGE_CACHE_QUEUE') || '', async (consumeMessage) => {
            if (!consumeMessage) return
            try {
                await this.delPostPageCache()
                this.channel.ack(consumeMessage)
            } catch (error) {
                this.logger.error('Failed invalidated error: ', error)
                this.channel.nack(consumeMessage, false, false)
            }
        })
    }

    async delPostPageCache() {
        await this.cacheService.del(
            this.configService.get<string>('CACHE_KEY_POST_PAGE1') || ''
        )
    }

    async onModuleDestroy() {
        if (this.channel) {
            await this.channel.close()
        }
    }
}