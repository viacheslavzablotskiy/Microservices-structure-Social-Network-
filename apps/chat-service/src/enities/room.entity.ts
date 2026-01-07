import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {HydratedDocument} from 'mongoose'

@Schema({timestamps: true})
export class Room {
    @Prop({required: true})
    name: string

    @Prop({type: [Number], required: true})
    participiants: number[]

    @Prop({default: false})
    isGroup: boolean
}

export type RoomType = HydratedDocument<Room>

export const RoomSchema = SchemaFactory.createForClass(Room)