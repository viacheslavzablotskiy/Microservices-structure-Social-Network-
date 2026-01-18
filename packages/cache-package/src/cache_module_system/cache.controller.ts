import { Controller } from "@nestjs/common";
import { CacheService } from "./cache.provider";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import {Channel, ConsumeMessage} from 'amqplib'


@Controller()
export class CacheEventsController {

    constructor(
        private readonly cacheService: CacheService
    ) {}

    async getSomeChache<T>(data: {key: string}): Promise<T> {
        const respons: T = await this.cacheService.get(data.key)
        return respons
    }

    async handleUpdateCache(data: {key: string, value: any}): Promise<void> {
        await this.cacheService.set(data.key, data.value)
    }

    async handleDeleteCache(data: {key: string}): Promise<void> {
        await this.cacheService.del(data.key)
    }
}