import { Prop, raw, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Types, HydratedDocument } from "mongoose";
import {EventType, ObjectType} from '@repo/user-interfaces'

@Schema({timestamps: true})
export class Notification {
    @Prop({type: mongoose.Types.ObjectId, ref: 'Room'})
    roomId: Types.ObjectId

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


    createdAt: Date
    updatedAt: Date
}


export type NotificationType = HydratedDocument<Notification>
export const NotificationSchema = SchemaFactory.createForClass(Notification)