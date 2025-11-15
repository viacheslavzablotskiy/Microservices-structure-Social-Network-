import { Controller } from "@nestjs/common";
import { CacheService } from "./cache.provider";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import {Channel, ConsumeMessage} from 'amqplib'


@Controller()
export class CacheEventsController {

    constructor(
        private readonly cacheService: CacheService
    ) {}

    @EventPattern('cache_update')
    async handleUpdateCache(@Payload() data: {key: string, value: any}, @Ctx() context: RmqContext): Promise<void> {
        const channel = context.getChannelRef() as Channel
        const message = context.getMessage() as ConsumeMessage

        try {
            await this.cacheService.set(data.key, data.value)
            
            channel.ack(message)
        } catch (error) {
            console.error('Error when you update cache')
            
            channel.nack(message, false, false)
        }

    }

    @EventPattern('cache_delete')
    async handleDeleteCache(@Payload() data: {key: string}, @Ctx() conetxt: RmqContext): Promise<void> {
        const channel = conetxt.getChannelRef() as Channel
        const message = conetxt.getMessage() as ConsumeMessage

        try {
            await this.cacheService.del(data.key)

            channel.ack(message)
        } catch (error) {
            console.error('Error when you trying delete some key')

            channel.nack(message, false, false)
        }
    }
}