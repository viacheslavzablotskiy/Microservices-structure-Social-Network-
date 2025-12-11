import {Like_Proto_Entity} from '@repo/user-interfaces'
import { Observable } from 'rxjs'

type MidstData = {
    like: number,
    isLiked: boolean
}

export interface ReturnLikeCountData {
    likes: Record<number, MidstData>
} 

export interface DistLikeService {
    createNewLike(data: Omit<Like_Proto_Entity, 'createdAt' | 'id'>) : Observable<Like_Proto_Entity>,
    deleteLike(data: {postId: number, userId: number}) : Observable<{}>
    GetCountOfLike(data: {postIds: number[], reqUser: number}): Observable<ReturnLikeCountData>
}