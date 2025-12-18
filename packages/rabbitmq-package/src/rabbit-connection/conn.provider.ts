import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib'


@Injectable()
export class ConnectionService implements OnModuleInit, OnModuleDestroy {   
    private conn: amqp.ChannelModel

    constructor(
        @Inject('GET_RABBITMQ_URL') private rabbitmqUrl: string
    ) {}

    async onModuleInit() {
        this.conn = await amqp.connect(this.rabbitmqUrl)
    }

    async getConnection(): Promise<amqp.ChannelModel> {
        return this.conn
    }

    async publish(channel: amqp.ConfirmChannel, exchangeName: string, exchangeRoutingKey: string, payload: any): Promise<void> {
        const buffer = Buffer.from(JSON.stringify(payload))
        return new Promise<void>((resolve, reject) => {
            channel.publish(exchangeName, exchangeRoutingKey, buffer, {persistent: true}, (ok, error) => {
                if (error) reject(error);
                else resolve(ok)
            })
        })
    }

    async publishRPC<T>(channel: amqp.Channel, exchangeName: string, routingKey: string, payload: any): Promise<T> {
        const correlationId = crypto.randomUUID()
        const replyToQueue = await channel.assertQueue('some_queue', {
            exclusive: true, autoDelete: true
        })

        return new Promise((resolve) => {
            channel.consume(replyToQueue.queue, async (consumeMessage) => {
                if (consumeMessage.properties.correlationId === correlationId) {
                    resolve(JSON.parse(consumeMessage.content.toString()))
                }
            })

            channel.publish(exchangeName, routingKey, payload, {
                replyTo: replyToQueue.queue,
                correlationId: correlationId,
                persistent: true
            })
        })
    }

    async onModuleDestroy() {
        if (this.conn) {
            await this.conn.close()
        }
    }

    async initDLX(
        channel: amqp.Channel,
        dlxEchange: string,
        dlxQueue: string,
        dlxRoutingKey: string
    ) : Promise<void> {
        await channel.assertExchange(dlxEchange, 'direct', {
            durable: true, autoDelete: false
        })
        await channel.assertQueue(dlxQueue, {
            durable: true, autoDelete: false
        })
        await channel.bindQueue(dlxQueue, dlxEchange, dlxRoutingKey)
    }

    async initQueue(
        channel: amqp.Channel,
        exchangeName: string, queueName: string, routingKey: string,
        dlxEchange: string, dlxRoutingKey: string, options?: amqp.Options.AssertQueue 
    ): Promise<void> {
        await channel.assertExchange(exchangeName, 'direct', {
            durable: true, autoDelete: false
        })
        await channel.assertQueue(queueName, {
            durable: true, autoDelete: false,
            messageTtl: 60000, maxLength: 10000,
            deadLetterExchange: dlxEchange, deadLetterRoutingKey: dlxRoutingKey, ...options
        })
        await channel.bindQueue(queueName, exchangeName, routingKey)
    }
}