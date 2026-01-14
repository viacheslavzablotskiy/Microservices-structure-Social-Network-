import { Inject, Injectable } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Connection, Model } from "mongoose";
import { Room } from "src/enities/room.entity";
import {type CreateNewGroupType, NewMemberType, DeleteMemberType} from '@repo/proto'
import { type RedisClientType } from "redis";
import { Notification, NotificationType } from "src/enities/notifications.entity";
import {NotificationTypeData, NotificationRedisAcceppt} from '@repo/user-interfaces'
import { ObjectType, EventType } from "@repo/user-interfaces";
import { RpcException } from "@nestjs/microservices";

@Injectable()
export class GroupNotificationService {

    constructor(
        @InjectModel(Notification.name) private readonly notificationModel: Model<Notification>,
        @InjectModel(Room.name) private readonly roomModel: Model<Room>,
        @Inject('REDIS_PUBLISH_INSTANCE') private readonly clientRedisInstance: RedisClientType,
        @InjectConnection() private readonly connection: Connection
    ) {}

    async convertMognoDBEntityToJson(data: NotificationType) {
        return {
            _id: data._id.toString(),
            roomId: data.roomId.toString(),
            event: data.event,
            payload: data.payload,
            createdAt: data.createdAt.toISOString(),
            updatedAt: data.updatedAt.toISOString()
        }
    }

    async createNewGroup(data: CreateNewGroupType): Promise<void> {

        const session = await this.connection.startSession()
        session.startTransaction()

        try {
            const newGroup = new this.roomModel({
            name: data.roomName,
            roomId: data.roomId,
            participiants: [],
            isGroup: true
        })
            await newGroup.save()

            await this.notificationModel.create({
                roomId: newGroup._id,
                event: EventType.ADD_NEW_GROUP,
                payload: {object: (newGroup._id).toString(), subject: data.authorId, objectType: ObjectType.METHOD_ABOUT_GROUP}  
            })
            await session.commitTransaction()
        } catch (error) {
            await session.abortTransaction()
            console.error(error)
        } finally {
            session.endSession()
        }
    }

    async addNewMemberToGroup(data: NewMemberType): Promise<void> {
        const session = await this.connection.startSession()
        session.startTransaction()

        try {

            const addedMember = await this.roomModel.findOneAndUpdate(
            {name: data.roomName, authorId: data.authorId},
            {$addToSet: {participiants: data.memberId}}, {new: true}
            ).exec()

            if (!addedMember) throw new RpcException(`Room ${data.roomName} not found or member coud not added`)

            const newNotification = await this.notificationModel.create({
                roomId: addedMember?._id,
                event: EventType.ADD_NEW_MEMBER,
                payload: {object: data.memberId.toString(), subject: data.authorId, objectType: ObjectType.METHOD_ABOUT_MEMBERS}
            })
            const body: NotificationRedisAcceppt = {notification: await this.convertMognoDBEntityToJson(newNotification), clientRoom: addedMember.roomId}
            this.clientRedisInstance.publish('group:member:newMember', JSON.stringify(body))   
            await session.commitTransaction()
        } catch (error) {
            await session.abortTransaction()
            console.error(error)
        } finally {
            await session.endSession()
        }
    }

    async deleteMemberFromGroup(data: DeleteMemberType): Promise<void> {
        const session = await this.connection.startSession()
        session.startTransaction()

        try {
            const deletedMember = await this.roomModel.findOneAndUpdate({name: data.roomName}, {
            $pull: {participiants: data.memberId}}, {new: true})   
                
            if (!deletedMember) throw new RpcException(`Room ${data.roomName} not found or member could not deleted`)
            
            const newNotificaiton = await this.notificationModel.create({
                roomId: deletedMember._id, event: EventType.DELETE_MEMBER,
                payload: {object: data.memberId.toString(), subject: data.authorId, objectType: ObjectType.METHOD_ABOUT_MEMBERS}
            })
            const body: NotificationRedisAcceppt = {notification: await this.convertMognoDBEntityToJson(newNotificaiton), clientRoom: deletedMember.roomId}
            this.clientRedisInstance.publish('group:member:deleteMember', JSON.stringify(body))
            await session.commitTransaction()
        } catch (error) {
            await session.abortTransaction()
            console.error(error)
        } finally {
            session.endSession()
        }
    }
}