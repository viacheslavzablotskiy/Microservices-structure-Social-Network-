import React from "react"
import { postEndpoints, useGetPostsQuery, useLazyGetPostsQuery } from "../../../main-app-settings/endpoints/post.enpoints"
import { useAppDispatch, useAppSeletctor } from "../../../main-app-settings/some-settings/main-hooks"
import { tokenSelector } from "../../access-token/AccessToken"
import type { RetrunPostEntity } from "@repo/user-interfaces"
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import { useToggleLikeMutation} from "../../../main-app-settings/endpoints/like.endpoints"

export const PostsPage = () => {
    const dispatch = useAppDispatch()
    const accessToken = useAppSeletctor(tokenSelector)
    const { data: posts } = useGetPostsQuery({})
    const [fetchMore, { data: morePosts }] = useLazyGetPostsQuery()

    if (!posts) {return <p>There is not posts yet</p>}
    return posts.map((post) => 
        { return <PostById key={post.id} postId={post.id}/>
    })
}

export const PostById: React.FC<{postId: number}> = ({ postId }) => {
    const {post} = useGetPostsQuery({}, {
        selectFromResult: ({data}) => {
            return {post: data?.find(post => post.id === postId)}
        }
    })
    return post ? <Post post={post}/> : null
}

export type PostProps = {
    post: RetrunPostEntity
}

export const Post: React.FC<PostProps> = React.memo(({post}) => {
    const postEnity: React.ReactNode = (
        <article className="post-card">
            <div className="post-image">
                <img src={post.imageUrl} alt={post.title} />
            </div>
            <div className="post-description">
                <p>{post.content}</p>
            </div>
            <PostFooter post={post}/>
        </article>
    )

    return postEnity
})

export const PostFooter: React.FC<PostProps> = ({post}) => {
    const [toggleLike] = useToggleLikeMutation()

    const changeLike = () => {
        toggleLike({postId: String(post.id), isLiked: post.isLiked})
    }

    return (
        <>
            <div className="likes">
                <button className={post.isLiked ? 'liked': ''} onClick={changeLike}>
                    {!post.isLiked ? 
                    <FavoriteBorderIcon color="secondary" fontSize="medium"/> :
                    <FavoriteIcon color="secondary" fontSize="medium"/>}
                    <p>{post.likeCount}</p>
                </button>
            </div>
            <div className="comments">
                    <ChatBubbleOutlineOutlinedIcon color="secondary" fontSize="medium"/>
                    <p>{post.commentCount}</p>
            </div>
        </>
    )
}