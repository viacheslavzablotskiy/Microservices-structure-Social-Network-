import { createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import { type RootStateStore } from "../store-settings/store";


export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({baseUrl: 'http://localhost:3005/',
        prepareHeaders: (headers: Headers, {getState}): Headers => {
            const token = (getState() as RootStateStore).token.currentValue?.accessToken;
            if (token) {
                headers.set('authorization', `Bearer ${token}`)
            }
            return headers
        },
        credentials: 'include',
    }
    ),
    keepUnusedDataFor: 300,
    refetchOnFocus: false,
    refetchOnReconnect: false,
    refetchOnMountOrArgChange: false,
    tagTypes: ['User', 'Post', 'Comment', 'Like', 'Message'],
    endpoints: () => ({})
})


