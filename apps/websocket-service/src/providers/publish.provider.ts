import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

/// THERE SHOULD BE GRPC TO CHAT SERVICE
/// REDIS PUSH WOULD IN CHAT SERVICE AFTER WE CREATE, UPDATE MESSAGE, DELETED MESSAGE


@Injectable()
export class RedisPublishChat {

    constructor(
        @Inject('REDIS_INSTANCE') private readonly client: ClientProxy 
    ) {}

    async createNewMessage(data: any): Promise<void> { 
        const createdMessage = await firstValueFrom(this.client.send('', data))
        return createdMessage
    } 

    async updateMessage(data: any): Promise<void> {
        const updatedMesage = await firstValueFrom(this.client.send('', data))
    }

    async deleteMessage(data: any): Promise<void> {
        try {
            await firstValueFrom(this.client.send('', data))
        } catch (error) {
            throw new HttpException('In proccessing deletetion message happens error', HttpStatus.BAD_REQUEST)
        }
    }
}