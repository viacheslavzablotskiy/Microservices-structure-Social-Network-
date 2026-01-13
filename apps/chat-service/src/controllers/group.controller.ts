import { Controller, Inject } from "@nestjs/common";
import { GrpcMethod, RpcException } from "@nestjs/microservices";
import {type CreateNewGroupType, type CreateNewMesageInGroupType, type UpdataMessageInGroupType,
    type DeleteMemberType, type NewMemberType, type DeleteMessageInGroupType} from '@repo/proto'
import { GroupService } from "src/providers/group.service";

@Controller()
export class GroupController {

    constructor(
        private readonly groupService: GroupService,
    ) {}

    @GrpcMethod('WebSocketGroupService', 'CreateNewGroup')
    async createNewGroup(data: CreateNewGroupType): Promise<void> {
        try {
            await this.groupService.createNewGroup(data)   
        } catch (error) {
            if (error instanceof RpcException) {
                throw new RpcException(error.getError())
            }
        }
    }

    @GrpcMethod('WebSocketGroupService', 'AddNewMember')
    async addNewMember(data: NewMemberType): Promise<void> {
        try {
            await this.groupService.addNewMemberToGroup(data)   
        } catch (error) {
            if (error instanceof RpcException) {
                throw new RpcException(error.getError())
            }
            throw new Error(error)
        }
    }

    @GrpcMethod('WebSocketGroupService', 'DeleteMember')
    async deleteMeember(data: DeleteMemberType): Promise<void> {
        try {
            await this.groupService.deleteMemberFromGroup(data)
        } catch (error) {
            if (error instanceof RpcException) {
                throw new RpcException(error.getError())
            }
            throw new Error(error)
        }
    }

    @GrpcMethod('WebSocketGroupService', 'CreateNewMessageGroup')
    async addNewMessageGroup(data: CreateNewMesageInGroupType): Promise<void> {
        try {
            await this.groupService.newMessageInGroup(data)
        } catch (error) {
            if (error instanceof RpcException) throw new RpcException(error.getError())
            throw new Error(error)
        }
    }
  
    @GrpcMethod('WebSocketGroupService', 'UpdateMessageGroup')
    async updateMessageGroup(data: UpdataMessageInGroupType): Promise<void> {
        try {
            await this.groupService.updateMessageInGroup(data)
        } catch (error) {
            if (error instanceof RpcException) throw new RpcException(error.getError())
            throw new Error(error)
        }
    }

    @GrpcMethod('WebSocketGroupService', 'DeleteMessageGroup')
    async deleteMessageGroup(data: DeleteMessageInGroupType): Promise<void> {
        try {
            await this.groupService.deleteMessageInGroup(data)
        } catch (error) {
            if (error instanceof RpcException) throw new RpcException(error.getError())
            throw new Error(error)
        }
    }
}