import { CommentEnity_Proto } from "@repo/user-interfaces";
import { Observable } from "rxjs";


export interface DistCommentService {
    getInitialCommentData(data: {postId: number}) : Observable<CommentEnity_Proto[]>,
    getOtherCommentData(data: {postId: number, lastId: number}) : Observable<CommentEnity_Proto[]>,
    createNewComment(data: Omit<CommentEnity_Proto, 'createdAt' | 'updatedAt' | 'id'>) : Observable<{}>,
    updateComment(data:  Omit<CommentEnity_Proto, 'createdAt' | 'updatedAt' | 'userId'>) : Observable<{}>,
    deleteComment(data: {postId: number, id: number}) : Observable<{}>
}