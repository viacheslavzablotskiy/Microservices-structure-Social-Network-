import { createSlice, type PayloadAction } from "@reduxjs/toolkit"



export interface AccessTokenAuth {
    access_token: string
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