import { Injectable, OnModuleInit } from "@nestjs/common";
import amqp from "amqp-connection-manager";
import { CacheService } from "@repo/chache-package";


@Injectable()
export class TestConsumer implements OnModuleInit {

    constructor(
        private readonly cacheService: CacheService
    ) {}
    
    async onModuleInit() {
        const conn = amqp.connect('amqp://localhost:5672')
        const channel = conn.createChannel()

        await channel.assertExchange('', 'direct', {
            durable: true,
            autoDelete: false
        })

        await channel.assertQueue('', {
            durable: true,
            autoDelete: false,
            arguments: {
                'x-message-ttl': 60000,
                'x-message-length': 10000,
                'x-dead-letter-exchange': 'errors_exchange',
                'x-dead-letter-routing-key': 'error_key'
            }
        })

        await channel.bindQueue('', '', '')

        channel.consume('', async (consumeMessage) => {
            const payload: {cacheKey: string} = JSON.parse(consumeMessage.content.toString())
            try {

                await this.delCommentCache(payload.cacheKey)

                channel.ack(consumeMessage)
            } catch (error) {
                channel.nack(consumeMessage, false, false)
            }
        }, {
            noAck: false
        })
        
    }


    async delCommentCache(cacheKey: string): Promise<void> {
        await this.cacheService.del(cacheKey)
    }
}