import z from "zod";


export const CreationCommentSchema = z.object({
    userId: z.number(),
    postId: z.number(),
    content: z.string()
})

export type CreationCommentType = z.infer<typeof CreationCommentSchema>


export const UpdatingCommentSchema = z.object({
    id: z.number(),
    postId: z.number(),
    content: z.string()
})


export type UpdatingCommentType = z.infer<typeof UpdatingCommentSchema>


export const DeleteCommentSchema = z.object({
    id: z.number(),
    postId: z.number()
})

export type DeleteCommentType = z.infer<typeof DeleteCommentSchema>