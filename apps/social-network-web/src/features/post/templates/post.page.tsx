import React, { useEffect, useRef, useState } from "react"
import { postEndpoints, useGetPostsQuery, useLazyGetPostsQuery } from "../../../main-app-settings/endpoints/post.enpoints"
import { Post } from "./post"

export const PostsPage = () => {
    const { data: posts = []} = useGetPostsQuery({})
    const [fetchMore] = useLazyGetPostsQuery()
    const currentRef = useRef<HTMLDivElement | null>(null)
    const [hasMore, setHasMore] = useState(true)
    const hasMoreRef = useRef<boolean>(hasMore)

    useEffect(() => {
        hasMoreRef.current = hasMore
    }, [hasMore])

    useEffect(() => {
        const observer = new IntersectionObserver(async (entries) => {
            const targetElement = entries[0]
            if (targetElement.isIntersecting && hasMoreRef.current) {
                const lastId = posts[posts.length - 1]?.id
                const {data} = await fetchMore({lastId: String(lastId)})
                if (data && data.length > 0) {
                    postEndpoints.util.updateQueryData('getPosts', {}, (draft) => {
                        draft.push(...data)
                    })
                } else {
                    setHasMore(false)
                    if (currentRef.current) observer.unobserve(currentRef.current)
                }
            }
        })
        
        if (currentRef.current) {
            observer.observe(currentRef.current)
        }

        return () => {
            if (currentRef.current) {
                observer.unobserve(currentRef.current)
            }
        }
    }, [fetchMore])
    return <>
    {posts.map((post) => { return <PostById key={post.id} postId={post.id}/>})}
    {hasMore && <div ref={currentRef} style={{height: '1px'}}></div>}
    </>
}

export const PostById: React.FC<{postId: number}> = ({ postId }) => {
    const {post} = useGetPostsQuery({}, {
        selectFromResult: ({data}) => {
            return {post: data?.find(post => post.id === postId)}
        }
    })
    return post ? <Post post={post}/> : null
}
