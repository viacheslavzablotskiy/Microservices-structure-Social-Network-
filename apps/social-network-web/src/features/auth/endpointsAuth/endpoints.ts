import type { LoginScemaUser, RegisterSchemaUser, User_Login_Data } from "@repo/user-interfaces";
import { apiSlice } from "../../../main-app-settings/store-settings/endpointsRTX-Query";

const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        
        loginInUser: builder.mutation<User_Login_Data , LoginScemaUser>({
            query: data => ({
                url: 'auth/login',
                method: 'POST',
                body: data,
            })
        }),

        registerUser: builder.mutation<void, RegisterSchemaUser>({
            query: (data) => ({
                url: 'auth/register',
                method: 'POST',
                body: data
            }),
        }),

        loguotUser: builder.mutation<void, void>({
            query: () => ({
                url: 'auth/logout',
                method: 'POST'
            }), invalidatesTags: ['Comment', 'Like', 'Message', 'Post', 'User']
        })
    })
})


export const {useLoginInUserMutation, useRegisterUserMutation} = authApi