import { configureStore } from "@reduxjs/toolkit";
import {FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER, persistStore} from 'redux-persist';
import { apiSlice } from "../endpoints/endpointsRTX-Query";
import {type EpicMiddleware, createEpicMiddleware} from 'redux-observable'
import type { RootActionAuth } from "../../features/auth/AuthSlice";
import { persistedRedusers, type RootStateRedusers } from "./combineReduser";

const epicMiddleware: EpicMiddleware<RootActionAuth, RootActionAuth, RootStateRedusers> = createEpicMiddleware<RootActionAuth, RootActionAuth, RootStateRedusers>()

export const store = configureStore({
    reducer: persistedRedusers,
    devTools: import.meta.env.MODE !== 'production',
    middleware: getDefaultMiddleware => getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: [FLUSH, REGISTER, REHYDRATE, PAUSE, PERSIST, PURGE]
        }
    }).concat(apiSlice.middleware).concat(epicMiddleware)
})
// epicMiddleware.run()

export const persister = persistStore(store)

export type AppStore = typeof store;

export type AppDispatch = typeof store.dispatch

export type RootStateStore = ReturnType<typeof store.getState>