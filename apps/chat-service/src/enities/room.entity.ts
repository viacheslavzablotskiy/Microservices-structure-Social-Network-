import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {HydratedDocument} from 'mongoose'

@Schema({timestamps: true})
export class Room {
    @Prop({required: true})
    name: string

    @Prop({type: String, required: true})
    roomId: string

    @Prop({type: [Number], required: true})
    participiants: number[]

    @Prop({type: Number, required: true})
    authorId: number

    @Prop({default: false})
    isGroup: boolean

    createdAt: Date
    updatedAt: Date
}

export type RoomType = HydratedDocument<Room>

export const RoomSchema = SchemaFactory.createForClass(Room)