export interface MessageEntity {
    _id: string,
    roomId: string,
    senderId: number,
    attachments?: string[],
    isEdited: boolean,
    isDeleted: boolean,
    createdAt: Date,
    updatedAt: Date
}


export interface RedisPublishData {
    message: Omit<MessageEntity, 'createdAt' | 'updatedAt'> & {createdAt: string, updatedAt: string},
    opponentId: number
}