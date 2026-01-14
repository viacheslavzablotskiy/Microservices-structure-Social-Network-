import { Injectable } from "@nestjs/common";
import { GrpcMethod, RpcException } from "@nestjs/microservices";
import { GroupNotificationService } from "src/providers/group.notification.provider";
import {type CreateNewGroupType, type NewMemberType, type DeleteMemberType} from '@repo/proto'


@Injectable()
export class NotificationGroupController {  

    constructor(
        private readonly groupNotificaitonService: GroupNotificationService
    ) {}

    
    @GrpcMethod('DistChatService', 'CreateNewGroup')
    async createNewGroup(data: CreateNewGroupType): Promise<void> {
        try {
            await this.groupNotificaitonService.createNewGroup(data)
        } catch (error) {
            if (error instanceof RpcException) throw new RpcException(error.getError())
            throw new Error(error)
        }
    }

    @GrpcMethod('DistChatService', 'AddNewMember')
    async addNewMember(data: NewMemberType): Promise<void> {
        try {
            await this.groupNotificaitonService.addNewMemberToGroup(data)
        } catch (error) {
            if (error instanceof RpcException) throw new RpcException(error.getError())
            throw new Error(error)
        }
    }

    @GrpcMethod('DistChatService', 'DeleteMember')
    async deleteMember(data: DeleteMemberType): Promise<void> {
        try {
            await this.groupNotificaitonService.deleteMemberFromGroup(data)
        } catch (error) {
            if (error instanceof RpcException) throw new RpcException(error.getError())
            throw new Error(error)
        }
    }
}