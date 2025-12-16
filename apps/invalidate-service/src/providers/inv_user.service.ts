import { Injectable, OnModuleInit } from "@nestjs/common";
import { CacheService } from "@repo/chache-package";
import amqp from "amqplib";


@Injectable()
export class InvalidateUserService implements OnModuleInit {


    constructor(private readonly cacheSerivce: CacheService) {}

    async onModuleInit() {
      const conn = await amqp.connect('amqp://localhost:5672')
      const channel = await conn.createChannel()


      await channel.assertExchange('cache_exchange', 'direct', {
        durable: true,
        autoDelete: false
      })

      await channel.assertQueue('user.login.queue', {
        durable: true, autoDelete: false, arguments: {
          'x-message-ttl': 60000, 'x-max-length': 10000,
          'x-dead-letter-exchange': 'errors_exchange', 'x-dead-letter-routing-key': 'error_key'
        }
      })

      await channel.bindQueue('user.login.queue', 'cache_exchange', 'user.login.key')

      channel.consume('user.login.queue', async (consumeMessage) => {
        if (!consumeMessage) return 
        const payload: {email: string} = JSON.parse(consumeMessage.content.toString())

        try {
          await this.delUserCache(payload.email)
          channel.ack(consumeMessage)
        } catch (error) {
          channel.nack(consumeMessage, false, false)
        }
      } )
    }

    async delUserCache(email: string): Promise<void> {
    await this.cacheSerivce.del(`email:${email}`)
  }
}