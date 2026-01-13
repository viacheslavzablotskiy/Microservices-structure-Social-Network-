import {Empty} from 'google-protobuf/google/protobuf/empty_pb'
import { Observable } from 'rxjs'

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

export interface CreateNewMesageInGroupType {
    message: string,
    authorId: number,
    roomName: string
}

export interface UpdataMessageInGroupType extends CreateNewMesageInGroupType {
    messageId: string
}

export type DeleteMessageInGroupType = Omit<UpdataMessageInGroupType, 'message'>


export interface WebSocketGroupService {
    createNewGroup(data: CreateNewGroupType): Observable<Empty>,
    addNewMember(data: NewMemberType): Observable<Empty>,
    deleteMember(data: DeleteMemberType): Observable<Empty>,
    createNewMessageGroup(data: CreateNewMesageInGroupType): Observable<Empty>,
    updateMessageGroup(data: UpdataMessageInGroupType): Observable<Empty>,
    deleteMessageGroup(data: DeleteMessageInGroupType): Observable<Empty>
}