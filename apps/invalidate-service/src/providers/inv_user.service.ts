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

      const cacheExchange = this.configService.get<string>('CACHE_EXCHANGE') || ''
      const dlxExchange = this.configService.get<string>('DLX_EXCHANGE') || ''
      const dlxRoutingKey = this.configService.get<string>('DLX_ROUTING_KEY') || ''
      const dlxQueue = this.configService.get<string>('DLX_QUEUE') || ''

      const userLoginQueue = this.configService.get<string>('USER_QUEUE') || ''
      const userLoginKey = this.configService.get<string>('USER_ROUTING_KEY') || ''
    
      if (!dlxExchange || !dlxQueue || !dlxRoutingKey || !cacheExchange || !userLoginKey || !userLoginQueue) {
      throw new Error('Missing RabbitMQ configuration');
    }
      await Promise.all([
        this.connectionService.initDLX(this.channel, dlxExchange, dlxQueue, dlxRoutingKey),
        this.connectionService.initQueue(this.channel, cacheExchange, userLoginQueue, userLoginKey, dlxExchange, dlxRoutingKey)
      ])

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