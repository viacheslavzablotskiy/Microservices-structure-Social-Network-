import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, {HydratedDocument} from "mongoose";
import { Room } from "./room.entity";



@Schema({timestamps: true})
export class Message {
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true})
    roomId: Room

    @Prop({type: Number, required: true})
    senderId: number

    @Prop({type: [String]})
    attachments: string[]

    @Prop({default: false})
    isEdited: false

    @Prop({default: false})
    isDeleted: false
}


export type MessageType = HydratedDocument<Message>
export const MessageSchema = SchemaFactory.createForClass(Message)