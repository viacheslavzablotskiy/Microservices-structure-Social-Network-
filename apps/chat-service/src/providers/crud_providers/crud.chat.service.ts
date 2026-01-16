import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {type FirstChatTimeData, type OtherChatTimeData} from '@repo/proto'
import { Model } from "mongoose";
import { MessageGroupDocument, MessageNotificationEntity } from "src/enities/message.notificaiton.entitiy";
import {ActionType, MessageEntityProto} from '@repo/user-interfaces'
import { MessageSchema } from "src/enities/message.entity";

@Injectable()
export class CrudChatService {
    constructor(
        @InjectModel(MessageNotificationEntity.name) private readonly messNotificModel: Model<MessageNotificationEntity>
    ) {}

    async methodConvertMessageToProto(data: MessageGroupDocument[]): Promise<MessageEntityProto> {
        const protoVersion = data.map(message => {
            return {
                ...message,
                _id: message._id.toString(),
                roomId: message.roomId.toString(),
                type: message.type,
                attachments: message.attachments,
                message: message.message,
                isEdited: message.isEdited,
                isDeleted: message.isDeleted,
                createdAt: message.createdAt.toISOString(),
                updatedAt: message.updatedAt.toISOString()
            }
        })
        return {messages: protoVersion}
    }


    async firstChatTimeData(data: FirstChatTimeData): Promise<MessageEntityProto> {
        const messages = await this.messNotificModel.discriminator(ActionType.MESSAGE_TYPE, MessageSchema).find(
        {roomId: data.chatId}).sort({_id: -1}).limit(30)
        return await this.methodConvertMessageToProto(messages)
    }


    async otherChatTimeData(data: OtherChatTimeData): Promise<MessageEntityProto> {
        const messages = await this.messNotificModel.discriminator(ActionType.MESSAGE_TYPE, MessageSchema).find(
            {roomId: data.chatId, _id: { $lt: data.lastId}}).sort({_id: -1}).limit(30)
        return await this.methodConvertMessageToProto(messages)
    }
}