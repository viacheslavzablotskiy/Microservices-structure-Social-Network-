import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import * as amqp from 'amqplib'
import { ConnectionService } from "@repo/rabbitmq-package";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { LikeEntity } from "src/entities/like.entity";
import { Repository } from "typeorm";


@Injectable()
export class EventLikeSerivce implements OnModuleInit, OnModuleDestroy {
    private channel: amqp.Channel


    constructor(
        @InjectRepository(LikeEntity) private readonly repositoryLike: Repository<LikeEntity>,
        private readonly connectionService: ConnectionService,
        private readonly configService: ConfigService,
    ) {}

    async onModuleInit() {
        const conn = await this.connectionService.getConnection()
        this.channel = await conn.createChannel()
        
        const cacheExchange = this.configService.get<string>('CACHE_EXCHANGE') || ''
        const dlxExchange = this.configService.get<string>('DLX_EXCHANGE') || ''
        const dlxRoutingKey = this.configService.get<string>('DLX_ROUTING_KEY') || ''
        const dlxQueue = this.configService.get<string>('DLX_QUEUE') || ''

        const likesDeleteQueue = this.configService.get<string>('LIKES_DELETE_QUEUE') || ''
        const likesDeleteKey = this.configService.get<string>('LIKES_DELETE_ROUTING_KEY') || ''
             

        if (!dlxExchange || !dlxQueue || !dlxRoutingKey || !cacheExchange || !likesDeleteKey || !likesDeleteQueue) {
      throw new Error('Missing RabbitMQ configuration');
      }

        await Promise.all([
            this.connectionService.initDLX(this.channel, dlxExchange, dlxQueue, dlxRoutingKey),
            this.connectionService.initQueue(this.channel, cacheExchange, likesDeleteQueue, likesDeleteKey, dlxExchange, dlxRoutingKey)
        ])

        this.channel.prefetch(10)

        this.channel.consume(likesDeleteQueue, async (consumeMessage) => {
            console.log('hello i like service');
            if (!consumeMessage) return
            const payload: {postId: number} = JSON.parse(consumeMessage.content.toString())
            console.log(payload);
            try {
                await this.deleteAllLikes(payload.postId)
                this.channel.ack(consumeMessage)               
            } catch (error) {
                console.error(error);
                this.channel.nack(consumeMessage, false, false)
            }
        })
    }

    async deleteAllLikes(postId: number): Promise<void> {
        console.log('we delet elike under this post: ', postId);
        
        await this.repositoryLike.delete({postId: postId})
    }

    async onModuleDestroy() {
        if (this.channel) {
            await this.channel.close()
        }
    }
}