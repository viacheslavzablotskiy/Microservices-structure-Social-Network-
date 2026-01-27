import { apiSlice } from "./endpointsRTX-Query";
import { postEndpoints } from "./post.enpoints";



export const likeEndpoints = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        toggleLike: builder.mutation<void, {postId: string, isLiked: boolean}>({
            query: ({postId, isLiked}) => ({
                url: `like/${postId}`,
                method: isLiked ? 'DELETE' : 'POST'
            }),
            async onQueryStarted({postId, isLiked}, {dispatch, queryFulfilled}) {
                const result = dispatch(postEndpoints.util.updateQueryData('getPosts', {}, (draft) => {
                    const currentPost = draft.find(post => post.id === Number(postId))
                    if (currentPost) {
                        currentPost.isLiked = !currentPost.isLiked,
                        currentPost.likeCount += currentPost.isLiked ? 1 : -1
                    }
                }))
                try {
                    await queryFulfilled
                } catch {
                    result.undo()
                }
            }
        })
    })
})


export const {useToggleLikeMutation} = likeEndpoints