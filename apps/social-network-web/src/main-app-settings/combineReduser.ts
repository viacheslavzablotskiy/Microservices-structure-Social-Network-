import { combineReducers } from "@reduxjs/toolkit";
import AuthRedusers from '../features/auth/AuthSlice'
import {persistReducer, type PersistConfig} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import TokenReduser from '../features/access-token/AccessToken'
import { apiSlice } from "./endpointsRTX-Query";

export const combineAllRedusers =  combineReducers({
    auth: AuthRedusers,
    token: TokenReduser,
    [apiSlice.reducerPath]: apiSlice.reducer
})

export type RootStateRedusers = ReturnType<typeof combineAllRedusers>

export const persisitConfig: PersistConfig<RootStateRedusers> = {
    key: 'root',
    storage,
    whitelist: ['auth'],
    blacklist: ['token']
}
export const persistedRedusers = persistReducer(persisitConfig, combineAllRedusers)