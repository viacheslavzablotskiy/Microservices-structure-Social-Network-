import { Injectable, OnModuleInit, Inject } from "@nestjs/common";
import { type ClientGrpc } from "@nestjs/microservices";
import {WebSocketChatService, type SendMessageChatData, type DataToUpdateMessageChat, type DataToDeleteMessageChat} from '@repo/proto' 
import { firstValueFrom } from "rxjs";

@Injectable()
export class ChatGPRCService implements OnModuleInit {
    private websocketChatService: WebSocketChatService

    constructor(
        @Inject('WEBSOCKET-CHAT-PATH') private readonly client: ClientGrpc 
    ) {}
    
    onModuleInit() {
        this.websocketChatService = this.client.getService<WebSocketChatService>('WebsocketChatService')
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