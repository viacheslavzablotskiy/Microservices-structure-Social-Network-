import { type CommentEntity } from "@repo/user-interfaces"
import React from "react"

export const Comment: React.FC<{comment: CommentEntity}> = React.memo(({comment}) => {
    return <>
        <p>{comment.content}</p>
    </>
})