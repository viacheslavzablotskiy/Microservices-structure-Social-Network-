import { CommentEnity_Proto } from "@repo/user-interfaces";
import { Observable } from "rxjs";

export interface ReturnCommentData {
    comments: CommentEnity_Proto[]
}

type CommentCount = Record<number, number>

export interface CommentReturnCount {
    comments: CommentCount
}


export interface DistCommentService {
    getInitialCommentData(data: {postId: number}) : Observable<ReturnCommentData>,
    getOtherCommentData(data: {postId: number, lastId: number}) : Observable<ReturnCommentData>,
    createNewComment(data: Omit<CommentEnity_Proto, 'createdAt' | 'updatedAt' | 'id' | 'userData' | 'userData'>) : Observable<CommentEnity_Proto>,
    updateComment(data:  Omit<CommentEnity_Proto, 'createdAt' | 'updatedAt' | 'postId' | 'userData'>) : Observable<CommentEnity_Proto>,
    deleteComment(data: {userId: number, postId: number, id: number}) : Observable<{}>
    getCountofLike(data: {postIds: number[]}) : Observable<CommentReturnCount>
}