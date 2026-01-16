import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { type ClientGrpc } from "@nestjs/microservices";
import { DistChatService } from "@repo/proto";
import { firstValueFrom } from "rxjs";



@Injectable()
export class MainChatService implements OnModuleInit {
    private distChatService: DistChatService

    constructor(
        @Inject('DIST-CHAT-PATH') private readonly client: ClientGrpc
    ) {}

    onModuleInit() {
        this.distChatService = this.client.getService<DistChatService>('DistChatService')    
    }


    async getChatFirstMessages(data: {chatId: string}): Promise<void> {
        const response = await firstValueFrom(this.distChatService.getChatFirstMessages(data))
    }

    async getChatOtherMessages(data: {chatId: string, lastId: string}): Promise<void> {
        const response = await firstValueFrom(this.distChatService.getChatOtherMessages(data))
    }
}