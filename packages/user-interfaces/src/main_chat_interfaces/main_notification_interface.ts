import { ActionType, ActionTypeProto } from "./message.notification.interface"

export enum EventType {
    ADD_NEW_GROUP = 'group_created',
    ADD_NEW_MEMBER = 'added_member',
    DELETE_MEMBER = 'deleted_member'
}

export enum ObjectType {
    METHOD_ABOUT_GROUP = 'room',
    METHOD_ABOUT_MEMBERS = 'user'
}

export enum EventTypeProto{
   EVENT_TYPE_UNSPECIFIED = 0,
   EVENT_TYPE_GROUP_CREATED = 1,
   EVENT_TYPE_ADDED_MEMBER= 2,
   EVENT_TYPE_DELETED_MEMBER= 3,
  
}
// enum for define what type is object is
export enum ObjectTypeProto{
  OBJECT_TYPE_UNSPECIFIED = 0,
  OBJECT_TYPE_ROOM = 1,
  OBJECT_TYPE_USER = 2,
}

export interface NotificationTypeData  {
    id: string,
    type: ActionType,
    roomId: string,
    event: EventType
    payload: {
        object: string,
        subject: number,
        objectType: ObjectType
    },
    createdAt: string,
    updatedAt: string
}

export interface NotificationTypeDataForClient  {
    id: string,
    type: ActionType,
    roomId: string,
    event: EventType
    payload: {
        object: string,
        subject: number,
        objectType: ObjectType
    },
    createdAt: Date,
    updatedAt: Date
}

export interface NotificationTypeDataProto  {
    id: string,
    roomId: string,
    type: ActionTypeProto,
    event: EventTypeProto
    payload: {
        object: string,
        subject: number,
        objectType: ObjectTypeProto
    },
    createdAt: string,
    updatedAt: string
}

export type NotificationRedisAcceppt = {
    notification: NotificationTypeData,
    clientRoom: string
}

export function mapEventTypeToProto(event: EventType): EventTypeProto {
    switch (event) {
        case EventType.ADD_NEW_GROUP: return EventTypeProto.EVENT_TYPE_GROUP_CREATED;
        case EventType.ADD_NEW_MEMBER: return EventTypeProto.EVENT_TYPE_ADDED_MEMBER;
        case EventType.DELETE_MEMBER: return EventTypeProto.EVENT_TYPE_DELETED_MEMBER;
        default: return EventTypeProto.EVENT_TYPE_UNSPECIFIED;
    }
} 

export function mapEventTypeProtoToEnum(event: EventTypeProto): EventType {
    switch (event) {
        case EventTypeProto.EVENT_TYPE_GROUP_CREATED: return EventType.ADD_NEW_GROUP;
        case EventTypeProto.EVENT_TYPE_ADDED_MEMBER: return EventType.ADD_NEW_MEMBER;
        case EventTypeProto.EVENT_TYPE_DELETED_MEMBER: return EventType.DELETE_MEMBER;
        default: return EventType.ADD_NEW_GROUP
    }
}

export function mapObjectTypeToProto(type: ObjectType): ObjectTypeProto {
    switch (type) {
        case ObjectType.METHOD_ABOUT_GROUP: return ObjectTypeProto.OBJECT_TYPE_ROOM;
        case ObjectType.METHOD_ABOUT_MEMBERS: return ObjectTypeProto.OBJECT_TYPE_USER;
        default: return ObjectTypeProto.OBJECT_TYPE_UNSPECIFIED;
    }
}

export function mapObjectProtoToEnum(type: ObjectTypeProto): ObjectType {
    switch (type) {
        case ObjectTypeProto.OBJECT_TYPE_ROOM: return ObjectType.METHOD_ABOUT_GROUP;
        case ObjectTypeProto.OBJECT_TYPE_USER: return ObjectType.METHOD_ABOUT_MEMBERS;
        default: return ObjectType.METHOD_ABOUT_GROUP
    }
}