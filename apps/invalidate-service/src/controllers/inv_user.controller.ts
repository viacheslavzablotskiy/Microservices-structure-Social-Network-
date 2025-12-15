import { Controller } from "@nestjs/common";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import {Channel, ConsumeMessage} from 'amqplib'
import { InvalidateUserService } from "src/providers/inv_user.service";

@Controller()
export class InvalidateUserController {

    constructor(
        private readonly invalidateUserService: InvalidateUserService
    ) {}


    @EventPattern('login.key')
    async delete_cache_after_update_user_or_delete(
        @Payload() data: {email: string}, @Ctx() context: RmqContext
    ): Promise<void> { 
        const channel: Channel = context.getChannelRef()
        const message = context.getMessage() as ConsumeMessage

        try {
            await this.invalidateUserService.delUserCache(data.email)

            channel.ack(message)
        } catch (error) {
            channel.nack(message, false, false)
        }
    }
}