import { Inject, Injectable } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Message, MessageSchema, MessageType } from "src/enities/message.entity";
import { Room, RoomType } from "src/enities/room.entity";
import {DeleteMessageInGroupType, type CreateNewGroupType, type CreateNewMesageInGroupType,
    type DeleteMemberType, type NewMemberType, type UpdataMessageInGroupType
} from '@repo/proto'
import { type RedisClientType } from "redis";
import {ActionType, type MessageGroupEntityAndRedisPublish, type RedisGroupPublish} from '@repo/user-interfaces'
import { MessageGroupDocument, MessageNotificationEntity } from "src/enities/message.notificaiton.entitiy";




@Injectable()
export class GroupService { 

    constructor(
        @InjectModel(Room.name) private roomModel: Model<Room>,
        @InjectModel(MessageNotificationEntity.name) private readonly messNotifModel: Model<MessageNotificationEntity>,
        @Inject('REDIS_PUBLISH_INSTANCE') private readonly clientRedisInstance: RedisClientType
    ) {}


    verifyRoomAndMemberShip(room: RoomType | null, memberId: number): boolean {
        if (!room) throw new RpcException('there is not room with this data')
        if (!room.participiants.includes(memberId)) throw new RpcException('you are not member of the group')
        return true
    }

    convertMongoDbEntityToJson(data: MessageGroupDocument): MessageGroupEntityAndRedisPublish {
        return {
            id: data._id.toString(),
            roomId: data.roomId.toString(),
            type: data.type,
            message: data.message,
            senderId: data.senderId,
            attachments: data.attachments,
            isEdited: data.isEdited,
            isDeleted: data.isDeleted,
            updatedAt: data.updatedAt.toISOString(),
            createdAt: data.createdAt.toISOString()
        }
    }

    async newMessageInGroup(data: CreateNewMesageInGroupType): Promise<void> {
        const currentRoom = await this.roomModel.findOne({name: data.roomName})

        this.verifyRoomAndMemberShip(currentRoom, data.authorId)

        const createdMessage = await this.messNotifModel.discriminator(ActionType.MESSAGE_TYPE, MessageSchema).create({
            roomId: currentRoom!._id,
            senderId: data.authorId,
            message: data.message,
            isDeleted: false,
            isEdited: false
        })
        const body: RedisGroupPublish = {message: this.convertMongoDbEntityToJson(createdMessage), clientRoom: currentRoom!.roomId}
        this.clientRedisInstance.publish('group:message:newMessage', JSON.stringify(body))
    }
    

    async updateMessageInGroup(data: UpdataMessageInGroupType): Promise<void> {
        const room = await this.roomModel.findOne({name: data.roomName})
        this.verifyRoomAndMemberShip(room, data.authorId)
        
        const updatedMessage = await this.messNotifModel.discriminator(ActionType.MESSAGE_TYPE, MessageSchema).findOneAndUpdate(
            {_id: data.messageId, roomId: room!.id},
            {$set: {isEdited: true, message: data.message}}, {new: true}
        )
        
        if (!updatedMessage) throw new RpcException('Message could not ')

        const body: RedisGroupPublish  = {message: this.convertMongoDbEntityToJson(updatedMessage), clientRoom: room!.roomId}

        this.clientRedisInstance.publish('group:message:updateMessage', JSON.stringify(body))
    }

    async deleteMessageInGroup(data: DeleteMessageInGroupType): Promise<void> {
        const room = await this.roomModel.findOne({name: data.roomName})
        this.verifyRoomAndMemberShip(room, data.authorId)

        const deletedMessage = await this.messNotifModel.discriminator(ActionType.MESSAGE_TYPE, MessageSchema).findOneAndUpdate(
            {_id: data.messageId, roomId: room!.id},
            {$set: {isDeleted: true}}, {new: true}
        )
        if (!deletedMessage) throw new RpcException('Message could not delete, because there is not message with this data')

        const body: RedisGroupPublish = {message: this.convertMongoDbEntityToJson(deletedMessage), clientRoom: room!.roomId}
        this.clientRedisInstance.publish('group:message:deleteMessage', JSON.stringify(body))
    }
}