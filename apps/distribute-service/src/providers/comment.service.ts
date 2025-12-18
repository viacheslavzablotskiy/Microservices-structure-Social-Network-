import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { type ClientGrpc } from "@nestjs/microservices";
import {CommentReturnCount, convertDateToTimeStamp, convertTimeStampToDate, DistCommentService} from '@repo/proto'
import { CommentEntity } from "@repo/user-interfaces";
import { firstValueFrom } from "rxjs";
import {Empty} from 'google-protobuf/google/protobuf/empty_pb'
import { int32, number } from "zod";



@Injectable()
export class MainCommentService implements OnModuleInit{
    private distCommentService: DistCommentService

    constructor(@Inject('DIST-COMMENT-PATH') private client: ClientGrpc) {}

    onModuleInit() {
        this.distCommentService = this.client.getService<DistCommentService>('DistCommentService')
    }


    async getInitialCommentData(data: {postId: number}): Promise<CommentEntity[]> {
        const response = await firstValueFrom(this.distCommentService.getInitialCommentData(data))

        if (!response.comments) return []

        const {comments} = response

        return comments.map((comment) => {
            return {
                ...comment,
                createdAt: convertTimeStampToDate(comment.createdAt),
                updatedAt: convertTimeStampToDate(comment.updatedAt)
            }
        })
    } 

    async getOtherPartOfData(data: {postId: number, lastId: number}) : Promise<CommentEntity[]> {
        const response = await firstValueFrom(this.distCommentService.getOtherCommentData(data))

        if (!response.comments) return []

        const {comments} = response

        return comments.map((comment) => {
            return {
                ...comment,
                createdAt: convertTimeStampToDate(comment.createdAt),
                updatedAt: convertTimeStampToDate(comment.updatedAt)
            }
        }) 
    }

    async creationNewComment(data: Pick<CommentEntity,'postId' | 'userId' | 'content'>) : Promise<CommentEntity> {
        const response = await firstValueFrom(this.distCommentService.createNewComment(data))
        return {
            ...response,
            createdAt: convertTimeStampToDate(response.createdAt),
            updatedAt: convertTimeStampToDate(response.updatedAt)
        }
    }

    async updationNewComment(data: Pick<CommentEntity, 'content' | 'id' | 'userId'>) : Promise<CommentEntity> {
        const response = await firstValueFrom(this.distCommentService.updateComment(data))
        return {
            ...response,
            createdAt: convertTimeStampToDate(response.createdAt),
            updatedAt: convertTimeStampToDate(response.updatedAt)
        }
    }

    async deleteComment(data: Pick<CommentEntity, 'postId' | 'userId' | 'id'>): Promise<Empty> {
        
        await firstValueFrom(this.distCommentService.deleteComment({
            id: data.id,
            userId: data.id,
            postId: data.postId
        }))
        return new Empty()
    }

    async getCountofComment(postIds: number[]): Promise<CommentReturnCount> {
        return await firstValueFrom(this.distCommentService.getCountofLike({postIds: postIds}))
    }
}

