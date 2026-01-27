import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { RootStateStore } from "../../main-app-settings/store-settings/store"



export interface AccessTokenAuth {
    accessToken: string
}

export interface MainValue {
    currentValue: AccessTokenAuth | null
}


export const initialState: MainValue = {
    currentValue: null
}

export const AccessTokenSlice = createSlice({
    name: 'token',
    initialState,
    reducers: {

        setToken(state, action: PayloadAction<AccessTokenAuth>) {
            state.currentValue = action.payload
        },

        deleteToken(state) {
            state.currentValue = null
        }
    }
})


export default AccessTokenSlice.reducer

export const {setToken, deleteToken} = AccessTokenSlice.actions

export type RootActionToken = ReturnType<typeof AccessTokenSlice.actions[keyof typeof AccessTokenSlice.actions]>

export const tokenSelector = (state: RootStateStore) => state.token.currentValue?.accessToken