import { Observable } from "rxjs"
import {Empty} from 'google-protobuf/google/protobuf/empty_pb'

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
    createNewGroup(data: CreateNewGroupType): Observable<Empty>,
    addNewMember(data: NewMemberType): Observable<Empty>,
    deleteMember(data: DeleteMemberType): Observable<Empty>,
}