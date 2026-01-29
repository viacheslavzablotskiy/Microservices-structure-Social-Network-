import type { CreateNewGroupType, MessageNotificationDTO, NotificationTypeDataForClient, RoomDocument } from "@repo/user-interfaces";
import { apiSlice } from "./endpointsRTX-Query";





export const groupEndpoints = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getGroupMessages: builder.query<MessageNotificationDTO, {roomId: string, lastId: string}>({
            query: (data) => {
                const query = new URLSearchParams()
                query.append('lastId', data.lastId)
                return `group/${data.roomId}?${query.toString()}`
            }
        }),

        createGroup: builder.mutation<RoomDocument, CreateNewGroupType>({
            query: (data) => {
                return {
                    url: 'group/createNewGroup',
                    method: 'POST',
                    body: data 
                }
            }
        }),

        addNewMember: builder.mutation<NotificationTypeDataForClient, {roomId: string, userId: string}>({
            query: (data) => {
                const query = new URLSearchParams()
                query.append('userId', data.userId)
                return {
                    url: `group/${data.roomId}/members?${query.toString()}`,
                    method: 'POST'
                }
            }
        }),

        deleteMember: builder.mutation<NotificationTypeDataForClient, {roomId: string, userId: string}>({
            query: (data) => {
                const query = new URLSearchParams()
                query.append('userId', data.userId)
                return {
                    url: `group/${data.roomId}/members?${query.toString()}`,
                    method: 'DELETE'
                }
            }
        })
    })
})


export const {useAddNewMemberMutation, useCreateGroupMutation, useDeleteMemberMutation, useLazyGetGroupMessagesQuery, useGetGroupMessagesQuery} = groupEndpoints