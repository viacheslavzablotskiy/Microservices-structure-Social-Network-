import {Empty} from 'google-protobuf/google/protobuf/empty_pb'
import { Observable } from 'rxjs'

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
    createNewMessageGroup(data: CreateNewMesageInGroupType): Observable<Empty>,
    updateMessageGroup(data: UpdataMessageInGroupType): Observable<Empty>,
    deleteMessageGroup(data: DeleteMessageInGroupType): Observable<Empty>
}