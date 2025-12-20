import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
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
        private readonly logger: Logger,
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

        await Promise.all([
            this.connectionService.initDLX(this.channel, dlxExchange, dlxQueue, dlxRoutingKey),
            this.connectionService.initQueue(this.channel, cacheExchange, likesDeleteQueue, likesDeleteKey, dlxExchange, dlxRoutingKey)
        ])

        this.channel.consume(likesDeleteQueue, async (consumeMessage) => {
            if (!consumeMessage) return
            const payload: {postid: number} = JSON.parse(consumeMessage.content.toString())

            try {
                
            } catch (error) {
                
            }
        })
    }

    async deleteAllLikes(postId: number): Promise<void> {
        await this.repositoryLike.delete({postId: postId})
    }

    async onModuleDestroy() {
        if (this.channel) {
            await this.channel.close()
        }
    }
}