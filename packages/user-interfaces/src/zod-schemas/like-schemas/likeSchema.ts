import z from "zod";


export const CreationLikeSchema = z.object({
    postId: z.number(),
})

export type CreationLikeType = z.infer<typeof CreationLikeSchema>


export const DeleteLikeSchema = z.object({
    id: z.number()
})

export type DeleteLikeType = z.infer<typeof DeleteLikeSchema>