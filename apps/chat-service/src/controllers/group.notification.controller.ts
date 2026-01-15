import { Injectable } from "@nestjs/common";
import { GrpcMethod, RpcException } from "@nestjs/microservices";
import { GroupNotificationService } from "src/providers/group.notification.provider";
import {type CreateNewGroupType, type NewMemberType, type DeleteMemberType} from '@repo/proto'
import {NotificationTypeDataProto, RoomTypeData} from '@repo/user-interfaces'

@Injectable()
export class NotificationGroupController {  

    constructor(
        private readonly groupNotificaitonService: GroupNotificationService
    ) {}

    
    @GrpcMethod('DistChatService', 'CreateNewGroup')
    async createNewGroup(data: CreateNewGroupType): Promise<RoomTypeData> {
        try {
            const repsonse = await this.groupNotificaitonService.createNewGroup(data)
            return repsonse
        } catch (error) {
            if (error instanceof RpcException) throw new RpcException(error.getError())
            throw new Error(error)
        }
    }

    @GrpcMethod('DistChatService', 'AddNewMember')
    async addNewMember(data: NewMemberType): Promise<NotificationTypeDataProto> {
        try {
            const response = await this.groupNotificaitonService.addNewMemberToGroup(data)
            return response
        } catch (error) {
            if (error instanceof RpcException) throw new RpcException(error.getError())
            throw new Error(error)
        }
    }

    @GrpcMethod('DistChatService', 'DeleteMember')
    async deleteMember(data: DeleteMemberType): Promise<NotificationTypeDataProto> {
        try {
            const response = await this.groupNotificaitonService.deleteMemberFromGroup(data)
            return response
        } catch (error) {
            if (error instanceof RpcException) throw new RpcException(error.getError())
            throw new Error(error)
        }
    }
}