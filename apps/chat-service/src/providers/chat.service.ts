import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Connection, Model } from 'mongoose';
import { Message, MessageSchema, MessageType } from 'src/enities/message.entity';
import { Room, RoomType } from 'src/enities/room.entity';
import {ActionType, MessageEntity, MessageGroupEntityAndRedisPublish, RedisPublishData} from '@repo/user-interfaces'
import {type  RedisClientType } from 'redis';
import {DataToDeleteMessageChat, DataToUpdateMessageChat, SendMessageChatData} from '@repo/proto'
import { MessageGroupDocument, MessageNotificationEntity } from 'src/enities/message.notificaiton.entitiy';

@Injectable()
export class ChatService{

  constructor(
    @InjectConnection() private connection: Connection,
    @InjectModel(Room.name) private roomModel: Model<Room>,
    @InjectModel(MessageNotificationEntity.name) private readonly messNotifModel: Model<MessageNotificationEntity>,
    @Inject('REDIS_PUBLISH_INSTANCE') private readonly redis: RedisClientType
  ) {}

  async convertToJson(data: MessageGroupDocument): Promise<MessageGroupEntityAndRedisPublish>{
    return {
      id: data._id.toString(),
      roomId: data.roomId.toString(),
      type: data.type,
      senderId: data.senderId,
      message: data.message,
      attachments: data.attachments,
      isEdited: data.isEdited,
      isDeleted: data.isDeleted,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString()
    }
  }


  async createNewMessageAndNewRoom(data: SendMessageChatData): Promise<MessageType> {

    const roomName = [data.opponentId, data.senderId].sort().join(':')
    let isRoomExisted = await this.roomModel.find({name: roomName})

    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      if (!isRoomExisted) {
        isRoomExisted = await this.roomModel.create([{ name: roomName, participiants: [data.opponentId, data.senderId], isGroup: false }], { session });
      }

      const newMessage = await this.messNotifModel.discriminator(ActionType.MESSAGE_TYPE, MessageSchema).create([{
        roomId: isRoomExisted[0]._id,
        message: data.message,
        senderId: data.senderId,
        isDeleted: false,
        isEdited: false
      }], {session: session})

      const redisData: RedisPublishData = {opponentId: data.opponentId, message: await this.convertToJson(newMessage[0])}
      this.redis.publish('chat:newMessage', JSON.stringify(redisData))

      await session.commitTransaction()
      return newMessage[0]
    } catch (error) {
      await session.abortTransaction()
      throw new RpcException('Invalid that during creaiton new message or room')
    } finally {
      await session.endSession()
    }
  }


  async deleteMessageChat(data: DataToDeleteMessageChat): Promise<void> { 
      const deletedMessage = await this.messNotifModel.discriminator(ActionType.MESSAGE_TYPE, MessageSchema).findOneAndUpdate(
        {_id: data.messageId, senderId: data.senderId},
        {$set: {isDeleted: true}}, {new: true}
      )
      if (!deletedMessage) throw new RpcException('There is not message with that condition')

      const redisData: RedisPublishData = {opponentId: data.opponentId, message: await this.convertToJson(deletedMessage)}
      this.redis.publish('chat:deleteMessaage', JSON.stringify(redisData))
  }

  async updateMessageChat(data: DataToUpdateMessageChat): Promise<void> {
    const updatedMessage = await this.messNotifModel.discriminator(ActionType.MESSAGE_TYPE, MessageSchema).findOneAndUpdate(
      {_id: data.messageId, senderId: data.senderId},
      {$set: {message: data.message, isEdited: true}}, {new: true}
    )
    if (!updatedMessage) throw new RpcException('There is not message with that condition')
    
    const redisData: RedisPublishData = {opponentId: data.opponentId, message: await this.convertToJson(updatedMessage)}
    this.redis.publish('chat:updateMessage', JSON.stringify(redisData))
  }
}
