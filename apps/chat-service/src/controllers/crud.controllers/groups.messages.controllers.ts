import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import {type FirstGroupTimeData, type OtherGroupTimeData} from '@repo/proto'
import { CrudGroupService } from "src/providers/crud_providers/crud.group.service";
import {MessageNotificationProtoData} from '@repo/user-interfaces'
@Controller()
export class CrudGroupMessagesControllers  {

    constructor(
        private readonly crudGroupservice: CrudGroupService
    ) {}

    @GrpcMethod('DistChatService', 'GetGroupFirstMessages')
    async firstGroupTimeData(data: FirstGroupTimeData): Promise<MessageNotificationProtoData> {
        const response = await this.crudGroupservice.firstGroupTimeData(data)
        return response
    }


    @GrpcMethod('DistChatService', 'GetGroupOtherMessages')
    async otherGroupTimeData(data: OtherGroupTimeData): Promise<MessageNotificationProtoData> {
        const response = await this.crudGroupservice.otherGroupTimeData(data)
        return response
    } 
}