import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { type RootStateStore } from "../../store-settings/store";
import { setToken, type MainValue } from "../../../features/access-token/AccessToken";
import { logoutUser } from "../../../features/auth/auth.slice";



export const rawBaseQuery = fetchBaseQuery({baseUrl: 'http://localhost:3005/',
        prepareHeaders: (headers: Headers, {getState}): Headers => {
            const token = (getState() as RootStateStore).token.currentValue?.accessToken;
            if (token) {
                headers.set('authorization', `Bearer ${token}`)
            }
            return headers
        },
        credentials: 'include',
    }
)

export const baseQueryWithReAuth = async (args: any, api: any, extraOptions: any) => {
    let result = await rawBaseQuery(args, api, extraOptions)

    if (result.error && result.error.status === 401) {
        const refreshTokenResult = await rawBaseQuery({
            url: 'auth/newToken', method: 'POST'
        }, api, extraOptions)

        if (refreshTokenResult.data) {
            const newToken = (refreshTokenResult.data as MainValue).currentValue!
            api.dispatch(setToken(newToken))


            result = await rawBaseQuery(args, api, extraOptions) 
        } else {
            api.dispatch(logoutUser())
        }
    } 

    return result
}