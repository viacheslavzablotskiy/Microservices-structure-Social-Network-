import { Inject, Injectable, NotAcceptableException, OnModuleInit } from "@nestjs/common";
import { type ClientGrpc } from "@nestjs/microservices";
import {DistChatService} from "@repo/proto"
import {v4 as uuidv4} from 'uuid'
import {type CreateNewGroupType, type NewMemberType, type DeleteMemberType} from '@repo/proto'
import { firstValueFrom } from "rxjs";
import { mapEventTypeProtoToEnum, mapObjectProtoToEnum, NotificationTypeData, NotificationTypeDataForClient, NotificationTypeDataProto, RoomDocument } from "@repo/user-interfaces";

@Injectable()
export class MainGrudGroupService implements OnModuleInit {
    private distChatService: DistChatService

    constructor(
        @Inject('DIST-CHAT-PATH') private readonly client: ClientGrpc
    ){}
    
    onModuleInit() {
        this.distChatService = this.client.getService<DistChatService>('DistChatService')
    }

    async convertNotificationToEnum(data: NotificationTypeDataProto): Promise<NotificationTypeData> {
        return {
            ...data,
            payload: {
                ...data.payload,
                objectType: mapObjectProtoToEnum(data.payload.objectType)
            },
            event: mapEventTypeProtoToEnum(data.event)
        }
    }


    async createNewGroup(data: Omit<CreateNewGroupType, 'roomId'>): Promise<RoomDocument> {
        const roomId = uuidv4()
        const response = await firstValueFrom(this.distChatService.createNewGroup({...data, roomId: roomId}))
        if (!response) throw new NotAcceptableException('Data does not match what you should get')
        return {
            ...response,
            createdAt: new Date(response.createdAt),
            updatedAt: new Date(response.updatedAt)
        }
    }

    async addNewMember(data: NewMemberType): Promise<NotificationTypeDataForClient> {
        const response  = await firstValueFrom(this.distChatService.addNewMember(data))
        if (!response) throw new NotAcceptableException('Data does not match waht you should get')
        const body = await this.convertNotificationToEnum(response)
        return {
            ...body,
            createdAt: new Date(body.createdAt),
            updatedAt: new Date(body.updatedAt)
        }
    }

    async deleteMember(data: DeleteMemberType): Promise<NotificationTypeDataForClient> {
        const response = await firstValueFrom(this.distChatService.deleteMember(data))
        if (!response) throw new NotAcceptableException('Data does not match what you should get')
        const body = await this.convertNotificationToEnum(response)
        return {
            ...body,
            createdAt: new Date(body.createdAt),
            updatedAt: new Date(body.updatedAt)
        }
    }
}