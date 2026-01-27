import type { CreationPostDataType, Post_Entity, RetrunPostEntity, UpdatePostDataType } from "@repo/user-interfaces";
import { apiSlice } from "./endpointsRTX-Query";



export const postEndpoints = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPosts: builder.query<RetrunPostEntity[], {lastId?: string}>({
            query: ({lastId}) => {
                const query = new URLSearchParams()
                if (lastId) query.append('lastId', lastId)
                return `post?${query.toString()}`
            }, 
        }),

        createPost: builder.mutation<RetrunPostEntity, CreationPostDataType>({
            query: (data) => {
                return {
                    url: 'post/createNewPost', 
                    method: 'POST',
                    body: data
                }
            }
        }),

        updatePost: builder.mutation<RetrunPostEntity, {data: UpdatePostDataType, postId: string}>({
            query: (post) => {
                return {
                    url: `post/${post.postId}`,
                    method: 'PATCH',
                    body: post.data
                }
            }
        }),

        deletePost: builder.mutation<void, {postId: string}>({
            query: (data) => {
                return {
                    url: `post/${data.postId}`,
                    method: 'DELETE'
                }
            }   
        })
    })
})


export const {useGetPostsQuery, useLazyGetPostsQuery, useCreatePostMutation, useDeletePostMutation, useUpdatePostMutation} = postEndpoints