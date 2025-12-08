import { CommentEnity_Proto } from "@repo/user-interfaces";
import { Observable } from "rxjs";

export interface ReturnCommentData {
    comments: CommentEnity_Proto[]
}

export interface DistCommentService {
    getInitialCommentData(data: {postId: number}) : Observable<ReturnCommentData>,
    getOtherCommentData(data: {postId: number, lastId: number}) : Observable<ReturnCommentData>,
    createNewComment(data: Omit<CommentEnity_Proto, 'createdAt' | 'updatedAt' | 'id'>) : Observable<{}>,
    updateComment(data:  Omit<CommentEnity_Proto, 'createdAt' | 'updatedAt' | 'userId' | 'postId'>) : Observable<{}>,
    deleteComment(data: {postId: number, id: number}) : Observable<{}>
}