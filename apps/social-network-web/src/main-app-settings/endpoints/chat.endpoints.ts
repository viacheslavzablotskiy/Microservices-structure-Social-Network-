import type { MessageEntity } from "@repo/user-interfaces";
import { apiSlice } from "./endpointsRTX-Query";




export const chatEndpoints = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        getMessages: builder.query<MessageEntity[], {chatId: string, lastId?: string}>({
            query: (data) => {
                const query = new URLSearchParams()
                if (data.lastId) query.append('lastId', data.lastId)
                return `chat/${data.chatId}?${data.lastId}`
            }
        })
    })
})