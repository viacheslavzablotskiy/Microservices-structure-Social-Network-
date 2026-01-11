import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, {HydratedDocument, Types} from "mongoose";
import { Room } from "./room.entity";



@Schema({timestamps: true})
export class Message {
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true})
    roomId: Types.ObjectId

    @Prop({type: Number, required: true})
    senderId: number

    @Prop({type: [String]})
    attachments: string[]

    @Prop({type: String, required: true})
    message:string 

    @Prop({default: false})
    isEdited: false

    @Prop({default: false})
    isDeleted: false

    createdAt: Date
    updatedAt: Date
}


export type MessageType = HydratedDocument<Message>
export const MessageSchema = SchemaFactory.createForClass(Message)