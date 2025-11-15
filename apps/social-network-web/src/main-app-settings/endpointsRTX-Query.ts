import { createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import type { RootStateStore } from "./store";


export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({baseUrl: 'http://localhost:3005/',
        prepareHeaders: (headers: Headers, {getState}): Headers => {
            const token = (getState() as RootStateStore).token.currentValue?.access_token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`)
            }
            return headers
        },
        credentials: 'include'
    }
    ),
    tagTypes: ['User', 'Post', 'Comment'],
    endpoints: () => ({})
})


