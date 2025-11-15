import z from 'zod'



export const CreationPostDataSchema = z.object({
    userId: z.number(),
    title: z.string(),
    content: z.string(),
    imageUrl: z.string()
})

export type CreationPostDataType = z.infer<typeof CreationPostDataSchema>


export const UpdatetingPostDataSchema = z.object({
    userId: z.number().optional(),
    title: z.string().optional(),
    content: z.string().optional(),
    imageUrl: z.string().optional()
})

export type UpdatePostDataType = z.infer<typeof UpdatetingPostDataSchema>


export const DeletePostDataSchema = z.object({
    id: z.number()
})


export type DeletePostDataType = z.infer<typeof DeletePostDataSchema>