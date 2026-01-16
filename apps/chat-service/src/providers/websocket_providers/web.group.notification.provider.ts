import { Inject, Injectable } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Connection, HydratedDocument, Model } from "mongoose";
import { Room, RoomType } from "src/enities/room.entity";
import {type CreateNewGroupType, NewMemberType, DeleteMemberType} from '@repo/proto'
import { type RedisClientType } from "redis";
import { Notification, NotificationSchema, NotificationType } from "src/enities/notifications.entity";
import {NotificationTypeData, NotificationRedisAcceppt,
     RoomTypeData, mapEventTypeToProto, mapEventTypeProtoToEnum,
     mapObjectProtoToEnum, mapObjectTypeToProto, NotificationTypeDataProto,
     mapActionTypeToProto} from '@repo/user-interfaces'
import { ObjectType, EventType, ActionType } from "@repo/user-interfaces";
import { RpcException } from "@nestjs/microservices";
import {NotificationGroupDocument, MessageNotificationEntity } from "src/enities/message.notificaiton.entitiy";
import { Message } from "src/enities/message.entity";

@Injectable()
export class GroupNotificationService {

    constructor(
        // @InjectModel(Notification.name) private readonly notificationModel: Model<Notification>,
        @InjectModel(MessageNotificationEntity.name) private readonly messNotificModel: Model<MessageNotificationEntity>,
        @InjectModel(Room.name) private readonly roomModel: Model<Room>,
        @Inject('REDIS_PUBLISH_INSTANCE') private readonly clientRedisInstance: RedisClientType,
        @InjectConnection() private readonly connection: Connection
    ) {}

    async convertMognoDBEntityToJson(data: NotificationGroupDocument): Promise<NotificationTypeData> {
        return {
            id: data._id.toString(),
            roomId: data.roomId.toString(),
            type: data.type,
            event: data.event,
            payload: data.payload,
            createdAt: data.createdAt.toISOString(),
            updatedAt: data.updatedAt.toISOString(),
        }
    }

    async convertMongoDBGroupToJson(data: RoomType): Promise<RoomTypeData>{
        return {
            id: data._id.toString(),
            name: data.name,
            participiants: data.participiants,
            isGroup: data.isGroup,
            createdAt: data.createdAt.toISOString(),
            updatedAt: data.updatedAt.toISOString()
        }
    }

    async convertNotificationToProto(data: NotificationTypeData): Promise<NotificationTypeDataProto> {
        return {
            ...data,
            type: mapActionTypeToProto(data.type),
            payload: {
                ...data.payload,
                objectType: mapObjectTypeToProto(data.payload.objectType)
            },
            event: mapEventTypeToProto(data.event)
        }
    }

    async createNewGroup(data: CreateNewGroupType): Promise<RoomTypeData> {

        const session = await this.connection.startSession()
        session.startTransaction()

        try {
            const newGroup = new this.roomModel({
            name: data.roomName,
            roomId: data.roomId,
            participiants: [],
            isGroup: true
        }, {session: session})
            await newGroup.save()
            await this.messNotificModel.discriminator(ActionType.NOTIFICATION_TYPE, NotificationSchema).create([{
                roomId: newGroup._id,
                event: EventType.ADD_NEW_GROUP,
                payload: {
                    object: (newGroup._id).toString(), subject: data.authorId, objectType: ObjectType.METHOD_ABOUT_GROUP
                }
            }], {session: session})
            await session.commitTransaction()
            const response = await this.convertMongoDBGroupToJson(newGroup)
            return response
        } catch (error) {
            await session.abortTransaction()
            console.error(error)
            throw new Error(error)
        } finally {
            session.endSession()
        }
    }

    async addNewMemberToGroup(data: NewMemberType): Promise<NotificationTypeDataProto> {
        const session = await this.connection.startSession()
        session.startTransaction()

        try {

            const addedMember = await this.roomModel.findOneAndUpdate(
            {name: data.roomName, authorId: data.authorId},
            {$addToSet: {participiants: data.memberId}}, {new: true, session: session}
            ).exec()

            if (!addedMember) throw new RpcException(`Room ${data.roomName} not found or member coud not added`)

            const newNotification = await this.messNotificModel.discriminator(ActionType.NOTIFICATION_TYPE, NotificationSchema).create([{
                roomId: addedMember._id,
                event: EventType.ADD_NEW_MEMBER,
                payload: {
                    object: (data.memberId).toString(), subject: data.authorId, objectType: ObjectType.METHOD_ABOUT_MEMBERS
                }
            }], {session: session})

            const notification = await this.convertMognoDBEntityToJson(newNotification[0])
            const body: NotificationRedisAcceppt = {notification: notification, clientRoom: addedMember.roomId} 
            await session.commitTransaction()
            this.clientRedisInstance.publish('group:member:newMember', JSON.stringify(body))  
            return await this.convertNotificationToProto(notification)
        } catch (error) {
            await session.abortTransaction()
            console.error(error)
            throw new Error(error)
        } finally {
            await session.endSession()
        }
    }

    async deleteMemberFromGroup(data: DeleteMemberType): Promise<NotificationTypeDataProto> {
        const session = await this.connection.startSession()
        session.startTransaction()

        try {
            const deletedMember = await this.roomModel.findOneAndUpdate({name: data.roomName}, {
            $pull: {participiants: data.memberId}}, {new: true, session: session})   
                
            if (!deletedMember) throw new RpcException(`Room ${data.roomName} not found or member could not deleted`)

            const newNotification = await this.messNotificModel.discriminator(ActionType.NOTIFICATION_TYPE, NotificationSchema).create([{
                roomId: deletedMember._id, event: EventType.DELETE_MEMBER,
                payload: {object:(data.memberId).toString(), subject: data.authorId, objectType: ObjectType.METHOD_ABOUT_MEMBERS}
            }], {session: session})

            const notification = await this.convertMognoDBEntityToJson(newNotification[0])
            const body: NotificationRedisAcceppt = {notification: notification, clientRoom: deletedMember.roomId}
            await session.commitTransaction()
            this.clientRedisInstance.publish('group:member:deleteMember', JSON.stringify(body))
            return await this.convertNotificationToProto(notification)
        } catch (error) {
            await session.abortTransaction()
            console.error(error)
            throw new Error(error)
        } finally {
            session.endSession()
        }
    }
}



// async convertMognoDBEntityToJson(data: MessageNotificationDocument) {
//         const base = {
//             id: data._id.toString(),
//             type: ActionType,
//             roomId: data.roomId.toString(),
//             createdAt: data.createdAt.toISOString(),
//             updatedAt: data.updatedAt.toISOString(),
            
//         }
//         if (data.type === ActionType.NOTIFICATION_TYPE) {
//             const body = data as unknown as HydratedDocument<MessageNotificationEntity & Notification>
//             return {
//                 ...base,
//                 type: ActionType.NOTIFICATION_TYPE,
//                 event: body.event,
//                 payload: body.payload
//             }
//         }

//         if (data.type === ActionType.MESSAGE_TYPE) {
//             const body = data as unknown as  HydratedDocument<MessageNotificationEntity & Message>
//             return {
//                 ...base,
//                 senderId: body.senderId,
//                 attachments: body.attachments,
//                 message: body.message,
//                 idEdited: body.isEdited,
//                 isDeleted: body.isDeleted
//             }
//         }
//     }