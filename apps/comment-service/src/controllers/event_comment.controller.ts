import { Controller } from "@nestjs/common";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import { Channel, ConsumeMessage, Message } from "amqplib";
import EventCommentService from "src/providers/eventPatter.comment";



@Controller()
export class EventCommentController {
    
    constructor (
        private readonly eventCommentService: EventCommentService
    ) {}


    @EventPattern('comments_key')
    async deleteComments(@Payload() data: {postId: number}, @Ctx() context: RmqContext): Promise<void> {
        const channel: Channel = context.getChannelRef()
        const message = context.getMessage() as ConsumeMessage
                
        try {
            
            await this.eventCommentService.deleteAllComment({postId: data.postId})

            channel.ack(message)
            channel.publish('errors_exchange', 'errors_key', Buffer.from(JSON.stringify(data)))
        } catch (error) {
            channel.nack(message, false, false)
        }
    } 
}
