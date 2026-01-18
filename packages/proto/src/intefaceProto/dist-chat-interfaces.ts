import { Observable } from "rxjs"
import { NotificationTypeDataProto, RoomTypeData, MessageEntityProto, MessageNotificationProtoData } from "@repo/user-interfaces"

export interface CreateNewGroupType {
    roomName: string,
    roomId: string
    authorId: number
}
export interface NewMemberType extends Omit<CreateNewGroupType, 'roomId'> {
    memberId: number
}
export interface DeleteMemberType extends Omit<CreateNewGroupType, 'roomId'> {
    memberId: number
}
export interface FirstGroupTimeData {
    roomId: string
}
export interface OtherGroupTimeData extends FirstGroupTimeData {
    lastId: string
}
export interface FirstChatTimeData {
    chatId: string
}
export interface OtherChatTimeData extends FirstChatTimeData {
    lastId: string
}



export interface DistChatService {
    createNewGroup(data: CreateNewGroupType): Observable<RoomTypeData>,
    addNewMember(data: NewMemberType): Observable<NotificationTypeDataProto>,
    deleteMember(data: DeleteMemberType): Observable<NotificationTypeDataProto>,
    getGroupFirstMessages(data: FirstGroupTimeData): Observable<MessageNotificationProtoData>,
    getGroupOtherMessages(data: OtherGroupTimeData): Observable<MessageNotificationProtoData>,
    getChatFirstMessages(data: FirstChatTimeData): Observable<MessageEntityProto>,
    getChatOtherMessages(data: OtherChatTimeData): Observable<MessageEntityProto>
}