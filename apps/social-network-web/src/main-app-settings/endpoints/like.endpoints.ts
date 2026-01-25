import { apiSlice } from "./endpointsRTX-Query";
import {type CreationLikeType} from '@repo/user-interfaces'



const likeEndpoints = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createLike: builder.mutation<void, CreationLikeType>({
            query: (data) => {
                return {
                    url: 'like/create',
                    method: 'POST',
                    body: data
                }
            }
        }),

        deleteLike: builder.mutation<void, {postId: string}>({
            query: (data) => {
                return {
                    url: `like/${data.postId}`,
                    method: 'DELETE'
                }
            }
        })
    })
})


export const {useCreateLikeMutation, useDeleteLikeMutation} = likeEndpoints