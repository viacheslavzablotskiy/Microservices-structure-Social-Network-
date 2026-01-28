import { createApi} from "@reduxjs/toolkit/query/react";
import { baseQueryWithReAuth } from "./silent_refresh/custom.base.querty";


export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReAuth,
    keepUnusedDataFor: 300,
    refetchOnFocus: false,
    refetchOnReconnect: false,
    refetchOnMountOrArgChange: false,
    tagTypes: ['User', 'Post', 'Comment', 'Like', 'Message'],
    endpoints: () => ({})
})


