import { ActionType } from "./message.notification.interface"

export interface MessageEntity {
    id: string,
    type: ActionType,
    roomId: string,
    senderId: number,
    attachments?: string[],
    message: string,
    isEdited: boolean,
    isDeleted: boolean,
    createdAt: Date,
    updatedAt: Date
}


export interface RedisPublishData {
    message: Omit<MessageEntity, 'createdAt' | 'updatedAt'> & {createdAt: string, updatedAt: string},
    opponentId: number
}


export type MessageGroupEntityAndRedisPublish = Omit<MessageEntity, 'createdAt' | 'updatedAt'> & {createdAt: string, updatedAt: string}


export type RedisGroupPublish = {
    message: MessageGroupEntityAndRedisPublish,
    clientRoom: string
}

