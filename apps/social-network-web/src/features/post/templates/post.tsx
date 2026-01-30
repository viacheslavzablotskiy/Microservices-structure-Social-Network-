import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import { useToggleLikeMutation} from "../../../main-app-settings/endpoints/like.endpoints"
import {type RetrunPostEntity} from '@repo/user-interfaces'
import React from 'react';

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