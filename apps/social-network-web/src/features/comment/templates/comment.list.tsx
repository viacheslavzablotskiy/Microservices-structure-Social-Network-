import type React from "react"
import { commentEndpoints, useGetCommentsQuery, useLazyGetCommentsQuery } from "../../../main-app-settings/endpoints/comment.endpoints"
import { useParams } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import { useAppDispatch } from "../../../main-app-settings/some-settings/main-hooks"
import { Comment } from "./comment"
import { imageEndpoints, useGetBatchDataUserQuery, useLazyGetBatchDataUserQuery } from "../../../main-app-settings/endpoints/images.endpoints"

export const CommentList = () => {
    const { postId } = useParams()
    const {data: comments = []} = useGetCommentsQuery({postId: postId!})
    const [fetchMore] = useLazyGetCommentsQuery()
    const dispatch = useAppDispatch()

    const {data: batchData} = useGetBatchDataUserQuery({userIds: []})
    const [fetchUserBatch] = useLazyGetBatchDataUserQuery()

    const [hasMore, setHasMore] = useState(true)
    const isHaveMore = useRef<boolean>(hasMore)
    const tagretElement = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        isHaveMore.current = hasMore
    }, [hasMore])


    useEffect(() => {
        const observer = new IntersectionObserver(async (entries: IntersectionObserverEntry[]) => {
            const currentElement = entries[0]
            if (currentElement.isIntersecting && isHaveMore.current) {
                const lastId = comments[comments.length - 1].id
                const {data} = await fetchMore({postId: postId!, lastId: String(lastId)}) 
                if (data && data.length > 0) {
                    dispatch(commentEndpoints.util.updateQueryData('getComments', {postId: postId!}, (draft) => {
                        draft.push(...data)
                    }))
                    
                    const userIds = [...new Set(data.map(comment => comment.userId))]
                    const response = await fetchUserBatch({userIds})
                    dispatch(imageEndpoints.util.updateQueryData('getBatchDataUser', {userIds: []}, (draft) => {
                        const {data} = response
                        for (const key in data) {
                            if (!draft[key] || draft[key].expiredAt < new Date()) {
                                draft[key] = data[key]
                            }
                            
                        }
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
    }, [fetchMore, fetchUserBatch, postId])

    return <>
    {comments?.map((comment) => {
        return <CommentById key={comment.id} commentId={comment.id} postId={postId!}/>
    })}
    {hasMore && <div ref={tagretElement} style={{height: '1px'}}></div>}
    </>
} 


export const CommentById: React.FC<{commentId: number, postId: string}> = ({commentId, postId}) => {
    const {comment} = useGetCommentsQuery({postId}, {
        selectFromResult: ({data}) => {
            return {comment: data?.find((comment) => comment.id = commentId)}
        }
    })

    return comment ? <Comment comment={comment}/> : null
}
