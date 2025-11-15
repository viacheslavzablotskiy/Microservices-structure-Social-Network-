import { Observable } from "rxjs";
import {Post_Enitity_Proto, CretionNewPost} from '@repo/user-interfaces'



export interface DistPostService {
    getInitialPosts({}) : Observable<Post_Enitity_Proto[]>,
    getSomePartPosts(data: {lastId: number}) : Observable<Post_Enitity_Proto[]>
    createNewPost(data: CretionNewPost) : Observable<{}>
    updatePost(data: Partial<Omit<Post_Enitity_Proto, 'createdAt' | 'updatedAt' | 'id'>>) : Observable<Post_Enitity_Proto>,
    deletePost(data: {id: number}) : Observable<{}>
}