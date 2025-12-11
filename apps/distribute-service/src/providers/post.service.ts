import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { type ClientGrpc } from "@nestjs/microservices";
import {convertTimeStampToDate, DistPostService} from '@repo/proto'
import { Post_Entity, RetrunPostEntity } from "@repo/user-interfaces";
import { firstValueFrom } from "rxjs";
import {Empty} from 'google-protobuf/google/protobuf/empty_pb'
import { MainCommentService } from "./comment.service";
import { LikeMainService } from "./like.service";

@Injectable()
export class MainPostService implements OnModuleInit{
    private distPostService: DistPostService

    constructor(
        @Inject('DIST-POST-PATH') private client: ClientGrpc,
        private readonly mainCommentService: MainCommentService,
        private readonly likeService: LikeMainService
    ) {}

    onModuleInit() {
        this.distPostService = this.client.getService<DistPostService>('DistPostService')
    }


    async getInitialPostsData(reqUser: number): Promise<RetrunPostEntity[]> {
        const response = await firstValueFrom(this.distPostService.getInitialPosts({})) ///there we need change
        console.log(response);
        const {posts} = response

        const postIds = posts.map(post => post.id)

        const commentObject = await this.mainCommentService.getCountofComment(postIds)
        const {comments} = commentObject
        console.log(commentObject);

        const likeObject = await this.likeService.likeCountOfPost(postIds, reqUser)
        const {likes} = likeObject 
        console.log(likeObject);

        return response.posts ? posts.map((post) => {
            return {
                ...post,
                createdAt: convertTimeStampToDate(post.createdAt),
                updatedAt: convertTimeStampToDate(post.updatedAt),
                likeCOunt: likes[post.id].like,
                countComent: comments[post.id],
                isLiked: likes[post.id].isLiked
            }
        }) : []
    }

    async getOtherPartOfData(data: {lastId: number, reqUser: number}): Promise<RetrunPostEntity[]> {
        const response = await firstValueFrom(this.distPostService.getSomePartPosts(data))
        console.log(response);
        const {posts} = response

        const postIds = posts.map(post => post.id)

        const commentObject = await this.mainCommentService.getCountofComment(postIds)
        const {comments} = commentObject

        const likeObject = await this.likeService.likeCountOfPost(postIds, data.reqUser)
        const {likes} = likeObject

        return response.posts ?posts.map((post) => {
            return {
                ...post,
                createdAt: convertTimeStampToDate(post.createdAt),
                updatedAt: convertTimeStampToDate(post.updatedAt),
                likeCOunt: likes[post.id].like,
                isLiked: likes[post.id].isLiked,
                countComent: comments[post.id]
            }
        }) : []
    }

    async creationNewPost(data: Omit<Post_Entity, 'createdAt' | 'updatedAt' | 'id'>) : Promise<Post_Entity> {
        const response = await firstValueFrom(this.distPostService.createNewPost(data))
        return {
            ...response,
            createdAt: convertTimeStampToDate(response.createdAt),
            updatedAt: convertTimeStampToDate(response.updatedAt)
        }
    }

    async updatePost(data: Partial<Omit<Post_Entity, 'createdAt' | 'updatedAt' | 'userId' | 'id'>>
        & Pick<Post_Entity, 'id' | 'userId'>
    ) : Promise<Post_Entity> {
        const response = await firstValueFrom(this.distPostService.updatePost(data)) /// there we return Post_Entity_Proto
        return {
            ...response,
            createdAt: convertTimeStampToDate(response.createdAt),
            updatedAt: convertTimeStampToDate(response.updatedAt)
        }
    }

    async deletePost(data: {id: number, userId: number}): Promise<Empty> {
        await firstValueFrom(this.distPostService.deletePost(data)) /// there we need add RabbitMq method to delete all comments and likes
        /// via async, and fire-forget
        return new Empty()
    }
}