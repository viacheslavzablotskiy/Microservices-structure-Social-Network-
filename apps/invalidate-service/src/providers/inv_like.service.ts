import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as amqp from 'amqplib'
import { CacheService } from "@repo/chache-package";
import {ConnectionService} from '@repo/rabbitmq-package'


@Injectable()
export class InvalidateLikeService implements OnModuleInit, OnModuleDestroy {
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
        this.channel, this.configService.get<string>('LIKE_COUNT_EXCHANGE') || '', this.configService.get<string>('LIKE_COUNT_QUEUE') || '',
        this.configService.get<string>('LIKE_COUNT_ROUTING_KEY') || '', this.configService.get<string>('DLX_EXCHANGE') || '',
        this.configService.get<string>('DLX_ROUTING_KEY') || ''
      ) 

      this.channel.prefetch(10)

      this.channel.consume(this.configService.get<string>('LIKE_COUNT_QUEUE') || '', async (consumeMessage) => {
        if (!consumeMessage) return
        const payload: {postId: number} = JSON.parse(consumeMessage.content.toString())

        try {
          await this.delLikeCountCache(payload.postId)

          this.channel.ack(consumeMessage)
        } catch (error) {
          this.channel.nack(consumeMessage, false, false)
        }
      }, {noAck: false})

    }

    async delLikeCountCache(postId: number): Promise<void> {
    await this.cacheSerivce.del(`postId:${postId}:like:count`)
    }

    async onModuleDestroy() {
      if (this.channel) {
        await this.channel.close()
      }
    }
}