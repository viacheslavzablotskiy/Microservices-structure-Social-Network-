import type { CommentEntity, CreationCommentType, UpdatingCommentType } from "@repo/user-interfaces";
import { apiSlice } from "./endpointsRTX-Query";




export const commentEndpoints =  apiSlice.injectEndpoints({
    endpoints: (buidler) => ({
        getComments: buidler.query<CommentEntity[], {postId: string, lastId: string}>({
            query: data => {
                const query = new URLSearchParams()
                query.append('lastId', data.lastId)
                return `comments/${data.postId}?${query.toString()}`
            }
        }),

        createComment: buidler.mutation<CommentEntity, CreationCommentType>({
            query: (data) => {
                return {
                    url: 'comments/create',
                    method: 'POST',
                    body: data
                }
            }
        }),
        updateComment: buidler.mutation<CommentEntity, {commentId: string, data: UpdatingCommentType}>({
            query: (data) => {
                return {
                    url: `comments/${data.commentId}`,
                    method: 'PATCH',
                    body: data.data
                }
            }
        }),

        deleteComment: buidler.mutation<void, {commentId: string}>({
            query: (data) => {
                return {
                    url: `comments/${data.commentId}`,
                    method: 'DELETE'
                }
            }
        })
    })
})

export const {useCreateCommentMutation, useLazyGetCommentsQuery, useDeleteCommentMutation, useGetCommentsQuery, useUpdateCommentMutation} = commentEndpoints