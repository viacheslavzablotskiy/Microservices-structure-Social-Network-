import { Observable } from "rxjs"
import {Empty} from 'google-protobuf/google/protobuf/empty_pb'


export interface SendMessageChatData {
    senderId: number,
    opponentId: number,
    message: string
}

export interface DataToDeleteMessageChat {
    messageId: string,
    opponentId: number,
    senderId: number
}

export interface DataToUpdateMessageChat extends DataToDeleteMessageChat {
    message: string
}

export interface WebScoketChatService {
    sendMessageChat(data: SendMessageChatData): Observable<Empty>,
    updateMessageChat(data: DataToUpdateMessageChat): Observable<Empty>,
    deleteMessageChat(data: DataToDeleteMessageChat): Observable<Empty>
}