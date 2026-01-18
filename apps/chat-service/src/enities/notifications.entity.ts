import { Prop, raw, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Types, HydratedDocument } from "mongoose";
import {EventType, ObjectType} from '@repo/user-interfaces'

@Schema()
export class Notification {
    @Prop({type: String, enum: EventType})
    event: EventType

    @Prop(raw({
        subject: {type: Number},
        object: {type: String},
        objectType: {type: String, enum: ObjectType}
    }))
    payload: {
        subject: number,
        object: string,
        objectType: ObjectType
    }
}


export type NotificationType = HydratedDocument<Notification>
export const NotificationSchema = SchemaFactory.createForClass(Notification)