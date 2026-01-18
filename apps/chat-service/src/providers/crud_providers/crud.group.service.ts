import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {type FirstGroupTimeData, type OtherGroupTimeData} from '@repo/proto'
import { Model } from "mongoose";
import { MessageGroupDocument, MessageNotificationDocument, MessageNotificationEntity, NotificationGroupDocument} from "src/enities/message.notificaiton.entitiy";
import {ActionType, mapActionTypeToProto, mapEventTypeToProto, mapObjectTypeToProto, MessageEntityProtoOne, NotificationTypeDataProto,
    MessageNotificationProtoData
} from '@repo/user-interfaces'

@Injectable()
export class CrudGroupService {
    constructor(
        @InjectModel(MessageNotificationEntity.name) private readonly messNotifModel: Model<MessageNotificationEntity>
    ) {}

    methodConvertMessageOrNotificaitonToProto(data: MessageNotificationDocument): (MessageEntityProtoOne | NotificationTypeDataProto) {
        const base = {
            id: data._id.toString(),
            roomId: data.roomId.toString(),
            createdAt: data.createdAt.toISOString(),
            updatedAt: data.updatedAt.toISOString()
        }
        if (data.type === ActionType.MESSAGE_TYPE) {
            const object = data as MessageGroupDocument
            return {
                ...base,
                type: mapActionTypeToProto(object.type),
                senderId: object.senderId,
                message: object.message,
                attachments: object.attachments,
                isEdited: object.isEdited,
                isDeleted: object.isDeleted,
            } as MessageEntityProtoOne
        }
        const object = data as NotificationGroupDocument
        return {
            ...base,
            type: mapActionTypeToProto(object.type),
            event: mapEventTypeToProto(object.event),
            payload: {
                ...object.payload,
                objectType: mapObjectTypeToProto(object.payload.objectType)
            }
        } as NotificationTypeDataProto
    }

    async firstGroupTimeData(data: FirstGroupTimeData):Promise<MessageNotificationProtoData> {
        const messagesOrNotificaiton = await this.messNotifModel.find({roomId: data.roomId}).sort({_id: -1}).limit(30)
        return {
            payload: messagesOrNotificaiton.map(object => this.methodConvertMessageOrNotificaitonToProto(object))
            }
    }

    async otherGroupTimeData(data: OtherGroupTimeData): Promise<MessageNotificationProtoData> {
        const messagesOrNotificaiton = await this.messNotifModel.find({roomId: data.roomId, _id: {$lt: data.lastId}}).sort({_id: -1}).limit(30)
        return {
            payload: messagesOrNotificaiton.map(object => this.methodConvertMessageOrNotificaitonToProto(object))
        }
    }
}