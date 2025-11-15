import {Like_Proto_Entity} from '@repo/user-interfaces'
import { Observable } from 'rxjs'


export interface DistLikeService {
    createNewLike(data: Omit<Like_Proto_Entity, 'createdAt' | 'id'>) : Observable<Like_Proto_Entity>,
    deleteLike({}) : Observable<{}>
}