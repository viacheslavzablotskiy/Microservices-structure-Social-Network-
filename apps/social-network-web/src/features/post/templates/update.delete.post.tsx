import { useParams } from "react-router-dom"
import { useDeletePostMutation, useUpdatePostMutation } from "../../../main-app-settings/endpoints/post.enpoints"
import { PostById } from "./post.page"
import { CommentList } from "../../comment/templates/comment.list"




export const PostByIdPage = () => {
    const { postId } = useParams()
    const [] = useDeletePostMutation()
    const [] = useUpdatePostMutation()

    if (!postId) throw new Error('there is not post with this Id')

    return <>
        <PostById  postId={Number(postId)}/>
        <CommentList postId={postId}/>
    </>
}