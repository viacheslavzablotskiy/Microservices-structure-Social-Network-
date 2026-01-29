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
        })
    })
})

export const {useUploadImageMutation, useGetTempraryUrlQuery} = imageEndpoints
