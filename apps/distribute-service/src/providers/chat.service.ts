import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { type ClientGrpc } from "@nestjs/microservices";
import { DistChatService } from "@repo/proto";
import { mapActionTypeToBack, MessageEntity, MessageEntityProto } from "@repo/user-interfaces";
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

    converyMessageProtoToJson(data: MessageEntityProto): MessageEntity[] {
        return data.messages.map(object => {
            return {
                ...object,
                type: mapActionTypeToBack(object.type),
                createdAt: new Date(object.createdAt),
                updatedAt: new Date(object.updatedAt)
            }
        })
    }


    async getChatFirstMessages(data: {chatId: string}): Promise<MessageEntity[]> {
        const response: MessageEntityProto = await firstValueFrom(this.distChatService.getChatFirstMessages(data))
        return this.converyMessageProtoToJson(response)
    }   

    async getChatOtherMessages(data: {chatId: string, lastId: string}): Promise<MessageEntity[]> {
        const response: MessageEntityProto = await firstValueFrom(this.distChatService.getChatOtherMessages(data))
        return this.converyMessageProtoToJson(response)
     }
}