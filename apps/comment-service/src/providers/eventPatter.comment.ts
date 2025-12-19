import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CommentEnity } from "src/entitis/comment.entity";
import { Repository } from "typeorm";
import * as amqp from 'amqplib'
import {ConnectionService} from '@repo/rabbitmq-package'
import { ConfigService } from "@nestjs/config";


@Injectable()
export class EventCommentService implements OnModuleInit, OnModuleDestroy{
    private channel: amqp.Channel

    constructor(
        @InjectRepository(CommentEnity)
        private readonly commentRepository: Repository<CommentEnity>,
        private readonly configService: ConfigService,
        private readonly connectionService: ConnectionService
    ) {}

    async onModuleInit() {
        const conn =  await this.connectionService.getConnection()
        this.channel = await conn.createChannel()

        await this.connectionService.initDLX(
        this.channel, this.configService.get<string>('DLX_EXCHANGE') || '', this.configService.get<string>('DLX_QUEUE') || '',
        this.configService.get<string>('DLX_ROUTING_KEY') || '' 
        )

        await this.connectionService.initQueue(
        this.channel, this.configService.get<string>('DELETE_COMMENTS_EXCHANGE') || '', this.configService.get<string>('DELETE_COMMENTS_QUEUE') || '',
        this.configService.get<string>('DELETE_COMMENT_KEY') || '', this.configService.get<string>('DLX_EXCHANGE') || '',
        this.configService.get<string>('DLX_ROUTING_KEY') || ''
        ) 

        this.channel.prefetch(10)

        await this.channel.consume(this.configService.get<string>('DELETE_COMMENTS_QUEUE') || '', async (consumeMessage) => {
            if (!consumeMessage) return
            const payload: {postId: number} = JSON.parse(consumeMessage.content.toString())

            try {
                await this.deleteAllComment({postId: payload.postId})

                this.channel.ack(consumeMessage)
            } catch (error) {
                console.error(error);
                this.channel.nack(consumeMessage, false, false)
            }
        }, {noAck: false})
    }


    async deleteAllComment(data: {postId: number}): Promise<void> {
        await this.commentRepository.delete({postId: data.postId})
    }

    async onModuleDestroy() {
        if (this.channel) {
            await this.channel.close()
        }
    }
}

export default EventCommentService