export enum EventType {
    ADD_NEW_GROUP = 'group_created',
    ADD_NEW_MEMBER = 'added_member',
    DELETE_MEMBER = 'deleted_member'
}

export enum ObjectType {
    METHOD_ABOUT_GROUP = 'room',
    METHOD_ABOUT_MEMBERS = 'user'
}


export interface NotificationTypeData  {
    _id: string,
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

export type NotificationRedisAcceppt = {
    notification: NotificationTypeData,
    clientRoom: string
}