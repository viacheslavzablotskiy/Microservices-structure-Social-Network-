import { Observable } from "rxjs"
import {Empty} from 'google-protobuf/google/protobuf/empty_pb'
import { NotificationTypeDataProto, RoomTypeData } from "@repo/user-interfaces"

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


export interface DistChatService {
    createNewGroup(data: CreateNewGroupType): Observable<RoomTypeData>,
    addNewMember(data: NewMemberType): Observable<NotificationTypeDataProto>,
    deleteMember(data: DeleteMemberType): Observable<NotificationTypeDataProto>,
}