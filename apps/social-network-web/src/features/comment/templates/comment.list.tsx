import type React from "react"
import { commentAdapter, commentEndpoints, commnetSelectors, useGetCommentsQuery, useLazyGetCommentsQuery } from "../../../main-app-settings/endpoints/comment.endpoints"
import { useParams } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import { useAppDispatch } from "../../../main-app-settings/some-settings/main-hooks"
import { Comment } from "./comment"

export type CommentProp = {
    postId: string
}

export const CommentList: React.FC<CommentProp> = ({postId}) => {
    const {data: comments} = useGetCommentsQuery({postId: postId!})
    const [fetchMore] = useLazyGetCommentsQuery()
    const dispatch = useAppDispatch()

    const [hasMore, setHasMore] = useState(true)
    const isHaveMore = useRef<boolean>(hasMore)
    const tagretElement = useRef<HTMLDivElement | null>(null)

    if (!comments) throw new Error('server error')

    useEffect(() => {
        isHaveMore.current = hasMore
    }, [hasMore])


    useEffect(() => {
        const observer = new IntersectionObserver(async (entries: IntersectionObserverEntry[]) => {
            const currentElement = entries[0]
            if (currentElement.isIntersecting && isHaveMore.current) {
                const allComments = commnetSelectors.selectAll(comments)
                if (allComments.length <= 0) {
                    setHasMore(false)
                    if (tagretElement.current) observer.unobserve(tagretElement.current)
                } 
                const lastId = allComments[allComments.length - 1].id
                const {data} = await fetchMore({postId: postId!, lastId: String(lastId)}) 
                if (data && data.ids.length > 0) {
                    dispatch(commentEndpoints.util.updateQueryData('getComments', {postId: postId!}, (draft) => {
                        commentAdapter.addMany(draft, commnetSelectors.selectAll(data))
                    }))
                } else {
                    setHasMore(false)
                    if (tagretElement.current) observer.unobserve(tagretElement.current)
                }
            }
        })

        if (tagretElement.current) {
            observer.observe(tagretElement.current)
        }

        return () => {
            if (tagretElement.current) {
                observer.disconnect()
            }
        }
    }, [fetchMore, postId])

    return <>
    {commnetSelectors.selectAll(comments).map((comment) => {
        return <CommentById key={comment.id} commentId={comment.id} postId={postId!}/>
    })}
    {hasMore && <div ref={tagretElement} style={{height: '1px'}}></div>}
    </>
} 


export const CommentById: React.FC<{commentId: number, postId: string}> = ({commentId, postId}) => {
    const {comment} = useGetCommentsQuery({postId}, {
        selectFromResult: ({data}) => {
            return {comment: data ? commnetSelectors.selectById(data, commentId): undefined}
        }
    })

    return comment ? <Comment comment={comment} postId={Number(postId)}/> : null
}
