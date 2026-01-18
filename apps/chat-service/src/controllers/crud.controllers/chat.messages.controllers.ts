import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import {type FirstChatTimeData, type OtherChatTimeData} from '@repo/proto'
import { CrudChatService } from "src/providers/crud_providers/crud.chat.service";
import {MessageEntityProto} from '@repo/user-interfaces'

@Controller()
export class MainChatMessagesControllers {

    constructor(
        private readonly crudChatService: CrudChatService
    ){}

    @GrpcMethod('DistChatService', 'GetChatFirstMessages')
    async firstChatTimeData(data: FirstChatTimeData): Promise<MessageEntityProto> {
        const response = await this.crudChatService.firstChatTimeData(data)
        return response
    }

    @GrpcMethod('DistChatService', 'GetChatOtherMessages')
    async otherChatTimeData(data: OtherChatTimeData): Promise<MessageEntityProto> {
        const response = await this.crudChatService.otherChatTimeData(data)
        return response
    }   
}