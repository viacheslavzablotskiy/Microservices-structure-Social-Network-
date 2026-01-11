import { Injectable, OnModuleInit, Inject } from "@nestjs/common";
import { type ClientGrpc } from "@nestjs/microservices";
import {WebScoketChatService, type SendMessageChatData, type DataToUpdateMessageChat, type DataToDeleteMessageChat} from '@repo/proto' 
import { firstValueFrom } from "rxjs";

@Injectable()
export class ChatGPRCService implements OnModuleInit {
    private websocketChatService: WebScoketChatService

    constructor(
        @Inject('WEBSOCKET-CHAT-PATH') private readonly client: ClientGrpc 
    ) {}
    
    onModuleInit() {
        this.websocketChatService = this.client.getService<WebScoketChatService>('WebScoketChatService')
    }


    async sendMessageToChat(data: SendMessageChatData): Promise<void> {
        await firstValueFrom(this.websocketChatService.sendMessageChat(data))
    }

    async updateMessageInChat(data: DataToUpdateMessageChat): Promise<void> {
        await firstValueFrom(this.websocketChatService.updateMessageChat(data))
    }

    async deleteMessageInChat(data: DataToDeleteMessageChat): Promise<void> {
        await firstValueFrom(this.websocketChatService.deleteMessageChat(data))
    }
}