import { Inject, Injectable, NotAcceptableException, OnModuleInit } from "@nestjs/common";
import { type ClientGrpc } from "@nestjs/microservices";
import {DistChatService} from "@repo/proto"
import {v4 as uuidv4} from 'uuid'
import {type CreateNewGroupType, type NewMemberType, type DeleteMemberType} from '@repo/proto'
import { firstValueFrom } from "rxjs";
import { ActionType, ActionTypeProto, mapActionTypeToBack, mapEventTypeProtoToEnum, mapObjectProtoToEnum, MessageEntity, MessageEntityProtoOne, MessageNotificationDTO, MessageNotificationProtoData, NotificationTypeData, NotificationTypeDataForClient, NotificationTypeDataProto, RoomDocument } from "@repo/user-interfaces";

@Injectable()
export class MainGrudGroupService implements OnModuleInit {
    private distChatService: DistChatService

    constructor(
        @Inject('DIST-CHAT-PATH') private readonly client: ClientGrpc
    ){}
    
    onModuleInit() {
        this.distChatService = this.client.getService<DistChatService>('DistChatService')
    }

    convertNotificationToEnum(data: NotificationTypeDataProto): NotificationTypeDataForClient {
        return {
            ...data,
            type: mapActionTypeToBack(data.type),
            payload: {
                ...data.payload,
                objectType: mapObjectProtoToEnum(data.payload.objectType)
            },
            event: mapEventTypeProtoToEnum(data.event),
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt)
        }
    }

    convertMessageToJson(data: MessageEntityProtoOne): MessageEntity {
        return {
            ...data,
            type: mapActionTypeToBack(data.type),
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt)
        }
    }

    convertMessagesAndNotification(data: MessageNotificationProtoData): MessageNotificationDTO {
        const body = data.payload.map((object) => {
            switch (object.type) {
                case ActionTypeProto.ACTOIN_TYPE_MESSAGE: {
                    return this.convertMessageToJson(object as MessageEntityProtoOne)
                }
                case ActionTypeProto.ACTION_TYPE_NOTIFICATION: {
                    const body = this.convertNotificationToEnum(object as NotificationTypeDataProto)
                    return {
                        ...body,
                        createdAt: new Date(body.createdAt),
                        updatedAt: new Date(body.updatedAt)
                    }
                }
                default: {
                    return this.convertMessageToJson(object as MessageEntityProtoOne)
                }
            }
        })
        return body
    } 


    async getGroupFirstData(data: {roomId: string}): Promise<MessageNotificationDTO> {
        const response: MessageNotificationProtoData = await firstValueFrom(this.distChatService.getGroupFirstMessages(data))
        return this.convertMessagesAndNotification(response)
    }


    async getGroupOtherData(data: {roomId: string, lastId: string}) : Promise<MessageNotificationDTO> {
        const response: MessageNotificationProtoData = await firstValueFrom(this.distChatService.getGroupOtherMessages(data))
        return this.convertMessagesAndNotification(response)
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
        const body =  this.convertNotificationToEnum(response)
        return body
    }

    async deleteMember(data: DeleteMemberType): Promise<NotificationTypeDataForClient> {
        const response = await firstValueFrom(this.distChatService.deleteMember(data))
        if (!response) throw new NotAcceptableException('Data does not match what you should get')
        const body =  this.convertNotificationToEnum(response)
        return body
    }
}