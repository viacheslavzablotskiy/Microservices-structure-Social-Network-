import type {CreationCommentType, ReturnCommentTypeData, UpdatingCommentType } from "@repo/user-interfaces";
import { apiSlice } from "./endpointsRTX-Query";
import { createEntityAdapter, type EntityState } from "@reduxjs/toolkit";

export const commentAdapter = createEntityAdapter({
    selectId: (comment: ReturnCommentTypeData) => comment.id,
    sortComparer: (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
})

export const commnetSelectors = commentAdapter.getSelectors()

export const commentEndpoints =  apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getComments: builder.query<EntityState<ReturnCommentTypeData, number>, {postId: string, lastId?: string}>({
            query: data => {
                const query = new URLSearchParams()
                if (data.lastId) query.append('lastId', data.lastId)
                return `comments/${data.postId}?${query.toString()}`
            },
            transformResponse: (response: ReturnCommentTypeData[]) => {
                return commentAdapter.addMany(commentAdapter.getInitialState(), response)
            }
        }),

        createComment: builder.mutation<ReturnCommentTypeData, CreationCommentType>({
            query: (data) => {
                return {
                    url: 'comments/create',
                    method: 'POST',
                    body: data
                }
            }
        }),
        updateComment: builder.mutation<ReturnCommentTypeData, {commentId: string, data: UpdatingCommentType}>({
            query: (data) => {
                return {
                    url: `comments/${data.commentId}`,
                    method: 'PATCH',
                    body: data.data
                }            
            },
        }),

        deleteComment: builder.mutation<void, {commentId: string}>({
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