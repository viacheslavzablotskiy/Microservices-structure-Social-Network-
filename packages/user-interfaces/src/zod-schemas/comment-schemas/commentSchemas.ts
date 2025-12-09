import z from "zod";


export const CreationCommentSchema = z.object({
    postId: z.number(),
    content: z.string()
})

export type CreationCommentType = z.infer<typeof CreationCommentSchema>


export const UpdatingCommentSchema = z.object({
    content: z.string()
})


export type UpdatingCommentType = z.infer<typeof UpdatingCommentSchema>


export const DeleteCommentSchema = z.object({
    postId: z.number()
})

export type DeleteCommentType = z.infer<typeof DeleteCommentSchema>