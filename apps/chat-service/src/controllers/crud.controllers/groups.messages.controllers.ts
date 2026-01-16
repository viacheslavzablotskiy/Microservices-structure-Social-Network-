import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import {type FirstGroupTimeData, type OtherGroupTimeData} from '@repo/proto'
import { CrudGroupService } from "src/providers/crud_providers/crud.group.service";

@Controller()
export class CrudGroupMessagesControllers  {

    constructor(
        private readonly crudGroupservice: CrudGroupService
    ) {}

    @GrpcMethod('DistChatService', 'GetGroupFirstMessages')
    async firstGroupTimeData(data: FirstGroupTimeData): Promise<void> {
        const response = await this.crudGroupservice.firstGroupTimeData(data)
    }


    @GrpcMethod('DistChatService', 'GetGroupOtherMessages')
    async otherGroupTimeData(data: OtherGroupTimeData): Promise<void> {
        const response = await this.crudGroupservice.otherGroupTimeData(data)
    } 
}