import { HttpException, HttpStatus, Inject, Injectable, OnModuleInit } from "@nestjs/common";
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
        try {
            const response = await firstValueFrom(this.distPostService.getInitialPosts({}))
            if (!response.posts) return []
            const postIds = response.posts.map(post => post.id)


            const [{comments}, {likes}] = await Promise.all([
                this.mainCommentService.getCountofComment(postIds),
                this.likeService.likeCountOfPost(postIds, reqUser)
            ])

            return response.posts.map((post) => {
                return {
                    ...post,
                    createdAt: convertTimeStampToDate(post.createdAt),
                    updatedAt: convertTimeStampToDate(post.updatedAt),
                    likeCount: likes[post.id].like,
                    commentCount: comments[post.id],
                    isLiked: likes[post.id].isLiked
                }
            }) 
        } catch (error) {
            throw new HttpException('Invalid data', HttpStatus.NOT_ACCEPTABLE, {
                cause: error
            })
        }
    }

    async getOtherPartOfData(data: {lastId: number, reqUser: number}): Promise<RetrunPostEntity[]> {
        try {
            const response = await firstValueFrom(this.distPostService.getSomePartPosts(data))
            if (!response.posts) return []
            const postIds = response.posts.map(post => post.id)

            const [{comments}, {likes}] = await Promise.all([
                this.mainCommentService.getCountofComment(postIds),
                this.likeService.likeCountOfPost(postIds, data.reqUser)
            ])

            return response.posts.map((post) => {
                return {
                    ...post,
                    createdAt: convertTimeStampToDate(post.createdAt),
                    updatedAt: convertTimeStampToDate(post.updatedAt),
                    likeCount: likes[post.id].like,
                    isLiked: likes[post.id].isLiked,
                    commentCount: comments[post.id]
                }
            })
        } catch (error) {
            throw new HttpException('Invalid data', HttpStatus.NOT_ACCEPTABLE, {
                cause: error
            })
        }
    }

    async creationNewPost(data: Omit<Post_Entity, 'createdAt' | 'updatedAt' | 'id'>) : Promise<RetrunPostEntity> {
        const response = await firstValueFrom(this.distPostService.createNewPost(data)).catch((error) => {
            throw new HttpException('Invalid data', HttpStatus.NOT_ACCEPTABLE, {
                cause: error
            })
        })
        return {
            ...response,
            commentCount: 0,
            likeCount: 0,
            isLiked: false,
            createdAt: convertTimeStampToDate(response.createdAt),
            updatedAt: convertTimeStampToDate(response.updatedAt)
        }
    }

    async updatePost(data: Partial<Omit<Post_Entity, 'createdAt' | 'updatedAt' | 'userId' | 'id'>>
        & Pick<Post_Entity, 'id' | 'userId'>
    ) : Promise<Post_Entity> {
        const response = await firstValueFrom(this.distPostService.updatePost(data)).catch((error) => {
            throw new HttpException('Invalid data', HttpStatus.NOT_ACCEPTABLE, {cause: error})
        }) /// there we return Post_Entity_Proto
        return {
            ...response,
            createdAt: convertTimeStampToDate(response.createdAt),
            updatedAt: convertTimeStampToDate(response.updatedAt)
        }
    }

    async deletePost(data: {id: number, userId: number}): Promise<Empty> {
        try {
            await firstValueFrom(this.distPostService.deletePost(data)) 
            return new Empty()
        } catch (error) {
            throw new HttpException('Invalid data', HttpStatus.NOT_ACCEPTABLE, {
                cause: error
            })
        }
    }
}