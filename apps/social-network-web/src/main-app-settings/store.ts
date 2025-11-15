import { configureStore } from "@reduxjs/toolkit";
import {persistedRedusers } from "./combineReduser";
import {FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER, persistStore} from 'redux-persist';
import { apiSlice } from "./endpointsRTX-Query";


export const store = configureStore({
    reducer: persistedRedusers,
    devTools: import.meta.env.MODE !== 'production',
    middleware: getDefaultMiddleware => getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: [FLUSH, REGISTER, REHYDRATE, PAUSE, PERSIST, PURGE]
        }
    }).concat(apiSlice.middleware)
})


export const persister = persistStore(store)

export type AppStore = typeof store;

export type AppDispatch = typeof store.dispatch

export type RootStateStore = ReturnType<typeof store.getState>