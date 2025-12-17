import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import amqp from "amqplib";
import { CacheService } from "@repo/chache-package";
import { RabbitConnectionService } from "./main_conection/inv_connection";
import { threadId } from "worker_threads";


@Injectable()
export class TestConsumer implements OnModuleInit, OnModuleDestroy {
    private channelData: amqp.Channel

    constructor(
        private readonly cacheService: CacheService,
        private readonly connectService: RabbitConnectionService
    ) {}
    
    async onModuleInit() {
        const conn = await this.connectService.getConnection()
        const channel = await conn.createChannel()
        this.channelData = channel

        await channel.assertExchange('test_exchange', 'direct', {
            durable: true,
            autoDelete: false
        })

        await channel.assertQueue('test_queue', {
            durable: true,
            autoDelete: false,
            arguments: {
                'x-message-ttl': 60000,
                'x-message-length': 10000,
                'x-dead-letter-exchange': 'errors_exchange',
                'x-dead-letter-routing-key': 'error_key'
            }
        })

        await channel.bindQueue('test_queue', 'test_exchange', 'test_key')

        channel.consume('test_queue', async (consumeMessage) => {
            if (!consumeMessage) return
            const payload: {cacheKey: string} = JSON.parse(consumeMessage.content.toString())
            try {

                await this.justTest(payload.cacheKey)

                channel.ack(consumeMessage)
            } catch (error) {
                channel.nack(consumeMessage, false, false)
            }
        }, {
            noAck: false
        })
        
    }


    async justTest(cacheKey: string): Promise<void> {
        console.log(`we get the key ${cacheKey}`);
        
    }

    async onModuleDestroy() {
        await this.channelData.close()
    }
}