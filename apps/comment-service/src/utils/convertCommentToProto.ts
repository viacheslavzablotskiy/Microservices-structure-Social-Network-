import {CommentEntity, CommentEnity_Proto} from '@repo/user-interfaces'
import {convertDateToTimeStamp} from '@repo/proto'


export function convertCommentToProtoComment(data: CommentEntity): CommentEnity_Proto {
    return {
        id: data.id,
        userId: data.userId,
        postId: data.postId,
        content: data.content,
        createdAt: convertDateToTimeStamp(data.createdAt),
        updatedAt: convertDateToTimeStamp(data.updatedAt)
    }
}