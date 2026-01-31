import React, { useEffect, useRef, useState } from "react"
import { postEndpoints, postsAdapter, postSelectors, useGetPostsQuery, useLazyGetPostsQuery } from "../../../main-app-settings/endpoints/post.enpoints"
import { Post } from "./post"
import { useAppDispatch } from "../../../main-app-settings/some-settings/main-hooks"

export const PostsPage = () => {
    const { data: posts } = useGetPostsQuery({})
    const [fetchMore] = useLazyGetPostsQuery()
    const dispatch = useAppDispatch()
    const currentRef = useRef<HTMLDivElement | null>(null)
    const [hasMore, setHasMore] = useState(true)
    const hasMoreRef = useRef<boolean>(hasMore)

    if (!posts) throw new Error('sever error')

    useEffect(() => {
        hasMoreRef.current = hasMore
    }, [hasMore])

    useEffect(() => {
        const observer = new IntersectionObserver(async (entries) => {
            const targetElement = entries[0]
            if (targetElement.isIntersecting && hasMoreRef.current) {
                const allPosts = postSelectors.selectAll(posts)
                if (allPosts.length <= 0) {
                    setHasMore(false)
                    if (currentRef.current) observer.unobserve(currentRef.current)
                }
                const lastId = allPosts[allPosts.length - 1].id
                const { data } = await fetchMore({ lastId: String(lastId) })
                if (data && data.ids.length > 0) {
                    dispatch(postEndpoints.util.updateQueryData('getPosts', {}, (draft) => {
                        postsAdapter.addMany(draft, postSelectors.selectAll(data))
                    }))
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
    }, [fetchMore, dispatch])
    return <>
        {postSelectors.selectAll(posts).map((post) => { return <PostById key={post.id} postId={post.id} /> })}
        {hasMore && <div ref={currentRef} style={{ height: '1px' }}></div>}
    </>
}

export const PostById: React.FC<{ postId: number }> = ({ postId }) => {
    const { post } = useGetPostsQuery({}, {
        selectFromResult: ({data}) => {
            return {post: data ? postsAdapter.getSelectors().selectById(data, postId) : undefined}
        }
    })
    return post ? <Post post={post} /> : null
}
