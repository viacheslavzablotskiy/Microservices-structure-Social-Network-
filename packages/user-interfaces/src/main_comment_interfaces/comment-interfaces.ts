import { TimeStamp } from "@repo/static-data"


export interface CommentEntity {
    id: number,
    userId: number,
    postId: number,
    content: string,
    createdAt: Date,
    updatedAt: Date
}

export interface CommentEnity_Proto {
    id: number,
    userId: number,
    postId: number,
    content: string,
    createdAt: TimeStamp,
    updatedAt: TimeStamp,
    userData: {
        avatarUrl: string,
        login: string
    }
}


export interface ReturnCommentTypeData extends CommentEntity{
    userData: {
        login: string,
        avatarUrl: string
    }
}
