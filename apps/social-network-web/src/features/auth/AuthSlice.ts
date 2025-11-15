import {type User_Entity_Login_OutputData} from '@repo/user-interfaces'
import {createSlice, type PayloadAction} from '@reduxjs/toolkit'


export interface AuthState {
    currentAuthUser: User_Entity_Login_OutputData | null
}

export const initialState: AuthState = {
    currentAuthUser: null
}

export const AuthSlice = createSlice({
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

export default AuthSlice.reducer

export const {loginInUser, logoutUser} = AuthSlice.actions

export type RootActionAuth = ReturnType<typeof AuthSlice.actions[keyof typeof AuthSlice.actions]>