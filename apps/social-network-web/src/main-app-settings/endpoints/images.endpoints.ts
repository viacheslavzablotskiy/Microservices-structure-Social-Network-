import type { BatchUser } from "@repo/user-interfaces";
import { apiSlice } from "./endpointsRTX-Query";




export const imageEndpoints = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        uploadImage: builder.mutation<{key: string}, File>({
            query: (file) => {
                const formData = new FormData()
                formData.append('image', file)
                return {
                    url: 'image/uploadImage',
                    method: 'POST'
                }
            }
        }),

        getTempraryUrl: builder.query<{path: string}, {key: string}>({
            query: (data) => {return `image/${data.key}`}
        }),

        getBatchDataUser: builder.query<BatchUser, {userIds: number[]}>({
            query: (data) => {
                const query = new URLSearchParams()
                data.userIds.forEach(userId => query.append('userIds', userId.toString()))
                return `image/batch?${query.toString()}`
            }
        })
    })
})

export const {useUploadImageMutation, useGetTempraryUrlQuery, useGetBatchDataUserQuery, useLazyGetBatchDataUserQuery, useLazyGetTempraryUrlQuery} = imageEndpoints
