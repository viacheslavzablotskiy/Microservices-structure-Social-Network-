import type { CreationPostDataType, RetrunPostEntity, UpdatePostDataType } from "@repo/user-interfaces";
import { apiSlice } from "./endpointsRTX-Query";
import { createEntityAdapter, type EntityState } from "@reduxjs/toolkit";

export const postsAdapter = createEntityAdapter({
    selectId: (post: RetrunPostEntity) => post.id,
    sortComparer: (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
});

export const postSelectors = postsAdapter.getSelectors()

export const postEndpoints = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPosts: builder.query<EntityState<RetrunPostEntity, number>, { lastId?: string }>({
            query: ({ lastId }) => {
                const query = new URLSearchParams();
                if (lastId) query.append('lastId', lastId);
                return `post?${query.toString()}`;
            },
            transformResponse: (response: RetrunPostEntity[]) => {
                return postsAdapter.addMany(postsAdapter.getInitialState(), response);
            }
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

        updatePost: builder.mutation<RetrunPostEntity, { data: UpdatePostDataType, postId: string }>({
            query: (post) => {
                return {
                    url: `post/${post.postId}`,
                    method: 'PATCH',
                    body: post.data
                }
            }
        }),

        deletePost: builder.mutation<void, { postId: string }>({
            query: (data) => {
                return {
                    url: `post/${data.postId}`,
                    method: 'DELETE'
                }
            }
        })
    })
})


export const { useGetPostsQuery, useLazyGetPostsQuery, useCreatePostMutation, useDeletePostMutation, useUpdatePostMutation } = postEndpoints