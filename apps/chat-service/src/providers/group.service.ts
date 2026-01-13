import { Inject, Injectable } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Message, MessageType } from "src/enities/message.entity";
import { Room, RoomType } from "src/enities/room.entity";
import {DeleteMessageInGroupType, type CreateNewGroupType, type CreateNewMesageInGroupType,
    type DeleteMemberType, type NewMemberType, type UpdataMessageInGroupType
} from '@repo/proto'
import { type RedisClientType } from "redis";




@Injectable()
export class GroupService { 

    constructor(
        @InjectModel(Room.name) private roomModel: Model<Room>,
        @InjectModel(Message.name) private messageModel: Model<Message>,
        @Inject('REDIS_PUBLISH_INSTANCE') private readonly clientRedisInstance: RedisClientType
    ) {}


    verifyRoomAndMemberShip(room: RoomType | null, memberId: number): boolean {
        if (!room) throw new RpcException('there is not room with this data')
        if (!room.participiants.includes(memberId)) throw new RpcException('you are not member of the group')
        return true
    }

    async createNewGroup(data: CreateNewGroupType): Promise<void> {
        const newGroup = new this.roomModel({
            name: data.roomName,
            roomId: data.roomId,
            participiants: [],
            isGroup: true
        })

        await newGroup.save()

        this.clientRedisInstance.publish('group:member:createNewGroup', JSON.stringify(newGroup))
    }

    async addNewMemberToGroup(data: NewMemberType): Promise<void> {
        const addedMember = await this.roomModel.updateOne(
            {name: data.roomName, authorId: data.authorId},
            {$addToSet: {participiants: data.memberId}}
        ).exec()

        this.clientRedisInstance.publish('group:member:newMember', JSON.stringify(addedMember))
    }

    async deleteMemberFromGroup(data: DeleteMemberType): Promise<void> {
        const deletedMember = await this.roomModel.updateOne({name: data.roomName}, {
            $pull: {participiants: data.memberId}
        })

        this.clientRedisInstance.publish('group:member:deleteMember', JSON.stringify(deletedMember))
    }


    async newMessageInGroup(data: CreateNewMesageInGroupType): Promise<void> {
        const currentRoom = await this.roomModel.findOne({name: data.roomName})

        this.verifyRoomAndMemberShip(currentRoom, data.authorId)

        const createdMessage = await this.messageModel.create({
            roomId: currentRoom!._id,
            senderId: data.authorId,
            message: data.message,
            isDeleted: false,
            isEdited: false
        })

        this.clientRedisInstance.publish('group:message:newMessage', JSON.stringify(createdMessage))
    }
    

    async updateMessageInGroup(data: UpdataMessageInGroupType): Promise<void> {
        const room = await this.roomModel.findOne({name: data.roomName})
        this.verifyRoomAndMemberShip(room, data.authorId)
        
        
        const updatedMessage = this.messageModel.findOneAndUpdate(
            {_id: data.messageId, roomId: room!._id},
            {$set: {isEdited: true, message: data.message}}, {new: true})
        
        if (!updatedMessage) throw new RpcException('Message could not ')

        this.clientRedisInstance.publish('group:message:updateMessage', JSON.stringify(updatedMessage))
    }

    async deleteMessageInGroup(data: DeleteMessageInGroupType): Promise<void> {
        const room = await this.roomModel.findOne({name: data.roomName})
        this.verifyRoomAndMemberShip(room, data.authorId)

        const deletedMessage = this.messageModel.findOneAndUpdate(
            {_id: data.messageId, roomId: room!._id},
            {$set: {isDeleted: true}}, {new: true})

        this.clientRedisInstance.publish('group:message:deleteMessage', JSON.stringify(deletedMessage))
    }
}