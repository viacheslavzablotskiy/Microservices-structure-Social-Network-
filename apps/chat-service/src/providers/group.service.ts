import { Injectable } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Message, MessageType } from "src/enities/message.entity";
import { Room, RoomType } from "src/enities/room.entity";





@Injectable()
export class GroupService { 

    constructor(
        @InjectModel(Room.name) private roomModel: Model<Room>,
        @InjectModel(Message.name) private messageModel: Model<Message>
    ) {}

    async createNewGroup(data: {roomKey: string, members: number[], isGroup: true}): Promise<RoomType> {
        const newGroup = new this.roomModel({
            name: data.roomKey,
            participiants: data.members,
            isGroup: data.isGroup
        })

        return newGroup.save()
    }

    async addNewMemberToGroup(data: {userId: number, roomKey: string, authorId: number}): Promise<void> {
        const dat =  await this.roomModel.updateOne(
            {name: data.roomKey, authorId: data.authorId},
            {$addToSet: {participiants: data.userId}}
        ).exec()
    }

    async deleteMemberFromGroup(data: {userId: number, roomKey: string, authorId: number}) {
        await this.roomModel.updateOne({name: data.roomKey}, {
            $pull: {participiants: data.userId}
        })
    }


    async newMessageInGroup(data: {roomName: string, senderId: number, message: string}): Promise<MessageType> {
        const currentRoom = await this.roomModel.find({name: data.roomName})

        if (!currentRoom) {
            throw new RpcException('there is no any room with this name')
        }

        return this.messageModel.create({
            roomId: currentRoom[0]._id,
            message: data.message,
            isDeleted: false,
            isEdited: false
        })
    }
    

    async updateMessageInGroup(data: {senderId: number, message: string, messageId: string}) {

    }

    async deleteMessageInGroup(data: {senderId: number, messageId: string}) {}
}