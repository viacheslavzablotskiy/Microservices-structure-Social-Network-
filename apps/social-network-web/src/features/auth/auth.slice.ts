import {type User_Entity_Login_OutputData} from '@repo/user-interfaces'
import {createSlice, type PayloadAction} from '@reduxjs/toolkit'
import type { RootStateStore } from '../../main-app-settings/store-settings/store'


export interface AuthState {
    currentAuthUser: User_Entity_Login_OutputData | null
}

export const initialState: AuthState = {
    currentAuthUser: null
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {

        loginInUser(state, action: PayloadAction<User_Entity_Login_OutputData>) {
            state.currentAuthUser = action.payload
        },

        logoutUser(state) {
            state.currentAuthUser = null
        }
    }
})

export default authSlice.reducer

export const {loginInUser, logoutUser} = authSlice.actions

export type RootActionAuth = ReturnType<typeof authSlice.actions[keyof typeof authSlice.actions]>

export const currentAuthUserSelector = (state: RootStateStore) => state.auth.currentAuthUser