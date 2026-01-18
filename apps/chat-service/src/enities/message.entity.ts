import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, {HydratedDocument, Types} from "mongoose";
import { Room } from "./room.entity";



@Schema()
export class Message {
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
}


export type MessageType = HydratedDocument<Message>
export const MessageSchema = SchemaFactory.createForClass(Message)