import { Controller } from "@nestjs/common"
import { EventPattern } from "@nestjs/microservices"
import {Channel, ConsumeMessage, } from 'amqplib'
import { Payload, Ctx, RmqContext} from "@nestjs/microservices"
import { InvalidateLikeService } from "src/providers/inv_like.service"

@Controller()
export class InvalidateLikeController {

    constructor(
        private readonly invalidateLikeService: InvalidateLikeService
    ) {}


    @EventPattern('like.count.key')
        async invalidate_like_cache_after_delete_post_or_delete_itself(
            @Payload() data: {postId: number}, @Ctx() context: RmqContext
        ): Promise<void> {
            const channel: Channel = context.getChannelRef()
            const message = context.getMessage() as ConsumeMessage

            try {
            await this.invalidateLikeService.delLikeCountCache(data.postId)

            channel.ack(message)
            } catch (error) {
            channel.nack(message, false, false)
            }
        }
}