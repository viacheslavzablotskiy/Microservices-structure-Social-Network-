import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import {type FirstChatTimeData, type OtherChatTimeData} from '@repo/proto'
import { CrudChatService } from "src/providers/crud_providers/crud.chat.service";

@Controller()
export class MainChatMessagesControllers {

    constructor(
        private readonly crudChatService: CrudChatService
    ){}

    @GrpcMethod('DistChatService', 'GetChatFirstMessages')
    async firstChatTimeData(data: FirstChatTimeData): Promise<void> {
        const response = await this.crudChatService.firstChatTimeData(data)
    }

    @GrpcMethod('DistChatService', 'GetChatOtherMessages')
    async otherChatTimeData(data: OtherChatTimeData): Promise<void> {
        const response = await this.crudChatService.otherChatTimeData(data)
    }   
}