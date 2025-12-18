import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { CacheService } from "@repo/chache-package";
import amqp from "amqplib";
import {ConnectionService} from '@repo/rabbitmq-package'
import { ConfigService } from "@nestjs/config";


@Injectable()
export class InvalidateUserService implements OnModuleInit, OnModuleDestroy {
    private channel: amqp.Channel

    constructor(
      private readonly cacheSerivce: CacheService,
      private readonly connectionService: ConnectionService,
      private readonly configService: ConfigService
    ) {}

    async onModuleInit() {
      const conn = await this.connectionService.getConnection()
      this.channel = await conn.createChannel()


      await this.connectionService.initDLX(
        this.channel, this.configService.get<string>('DLX_EXCHANGE') || '', this.configService.get<string>('DLX_QUEUE') || '',
        this.configService.get<string>('DLX_ROUTING_KEY') || '' 
      )

      await this.connectionService.initQueue(
        this.channel, this.configService.get<string>('CACHE_EXCHANGE') || '', this.configService.get<string>('USER_QUEUE') || '',
        this.configService.get<string>('USER_ROUTING_KEY') || '', this.configService.get<string>('DLX_EXCHANGE') || '',
        this.configService.get<string>('DLX_ROUTING_KEY') || ''
      )

      await this.channel.consume(this.configService.get<string>('USER_QUEUE') || '', async (consumeMessage) => {
        if (!consumeMessage) return 
        const payload: {email: string} = JSON.parse(consumeMessage.content.toString())

        try {
          await this.delUserCache(payload.email)

          this.channel.ack(consumeMessage)
        } catch (error) {
          this.channel.nack(consumeMessage, false, false)
          console.error(error);
        }
      }, {noAck: false})

    }

    async delUserCache(email: string): Promise<void> {
    await this.cacheSerivce.del(`email:${email}`)
    }

    async onModuleDestroy() {
      if (this.channel) {
        await this.channel.close()
      }
    }
}