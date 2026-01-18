import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose, { Types, HydratedDocument } from "mongoose"
import {ActionType} from '@repo/user-interfaces'
import { Message } from "./message.entity"
import { Notification } from "./notifications.entity"


@Schema({timestamps: true, discriminatorKey: 'type'})
export class MessageNotificationEntity {
    @Prop({type: mongoose.Types.ObjectId, ref: 'Room'})
    roomId: Types.ObjectId

    @Prop({type: String, enum: ActionType, required: true})
    type: ActionType

    createdAt: Date
    updatedAt: Date
}

export type MessageNotificationDocument = HydratedDocument<MessageNotificationEntity>
export type MessageGroupDocument = HydratedDocument<MessageNotificationEntity & Message>
export type NotificationGroupDocument = HydratedDocument<MessageNotificationEntity & Notification>
export const MessageNotificationSchema = SchemaFactory.createForClass(MessageNotificationEntity)