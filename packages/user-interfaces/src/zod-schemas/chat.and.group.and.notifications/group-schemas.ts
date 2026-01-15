import z from "zod";


export const createNewGroupSchema = z.object({
    roomName: z.string().min(3)  
})

export type CreateNewGroupType = z.infer<typeof createNewGroupSchema>


export const addNewMemberGroupSchema = z.object({
    roomName: z.string().min(3)
})

export type AddNewMemberGroup = z.infer<typeof addNewMemberGroupSchema>

export const deleteMemberGroupSchema = z.object({
    roomName: z.string().min(3)
})

export type DeleteMmemberGroup = z.infer<typeof deleteMemberGroupSchema>