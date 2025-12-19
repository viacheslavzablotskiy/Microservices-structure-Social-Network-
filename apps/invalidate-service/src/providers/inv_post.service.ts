import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
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
        this.channel, this.configService.get<string>('CACHE_EXCHANGE') || '', this.configService.get<string>('POST_PAGE_CACHE_QUEUE') || '',
        this.configService.get<string>('POST_PAGE_CACHE_ROUTING_KEY') || '', this.configService.get<string>('DLX_EXCHANGE') || '',
        this.configService.get<string>('DLX_ROUTING_KEY') || ''
        )

        this.channel.consume(this.configService.get<string>('POST_PAGE_CACHE_QUEUE') || '', async (consumeMessage) => {
            console.log('hello');
            
            if (!consumeMessage) return
            try {
                await this.delPostPageCache()

                this.channel.ack(consumeMessage)
            } catch (error) {
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