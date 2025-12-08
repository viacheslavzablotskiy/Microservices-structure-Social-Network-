import { Observable } from "rxjs";
import {Post_Enitity_Proto, CretionNewPost} from '@repo/user-interfaces'

export interface ReturnPostsDto {
    posts: Post_Enitity_Proto[]
}

export interface DistPostService {
    getInitialPosts({}) : Observable<ReturnPostsDto>,
    getSomePartPosts(data: {lastId: number}) : Observable<ReturnPostsDto>
    createNewPost(data: CretionNewPost) : Observable<{}>
    updatePost(data: Partial<Omit<Post_Enitity_Proto, 'createdAt' | 'updatedAt'>>) : Observable<Post_Enitity_Proto>,
    deletePost(data: {id: number}) : Observable<{}>
}