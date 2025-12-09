import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { type ClientGrpc } from "@nestjs/microservices";
import {convertTimeStampToDate, DistCommentService} from '@repo/proto'
import { CommentEntity } from "@repo/user-interfaces";
import { firstValueFrom } from "rxjs";
import {Empty} from 'google-protobuf/google/protobuf/empty_pb'



@Injectable()
export class MainCommentService implements OnModuleInit{
    private distCommentService: DistCommentService

    constructor(@Inject('DIST-COMMENT-PATH') private client: ClientGrpc) {}

    onModuleInit() {
        this.distCommentService = this.client.getService<DistCommentService>('DistCommentService')
    }


    async getInitialCommentData(data: {postId: number}): Promise<CommentEntity[]> {
        const response = await firstValueFrom(this.distCommentService.getInitialCommentData(data))

        const {comments} = response

        console.log(comments);
        
        
        return response.comments ? comments.map((comment) => {
            return {
                ...comment,
                createdAt: convertTimeStampToDate(comment.createdAt),
                updatedAt: convertTimeStampToDate(comment.updatedAt)
            }
        }) : []
    } 

    async getOtherPartOfData(data: {postId: number, lastId: number}) : Promise<CommentEntity[]> {
        const response = await firstValueFrom(this.distCommentService.getOtherCommentData(data))

        const {comments} = response

        return response.comments ? comments.map((comment) => {
            return {
                ...comment,
                createdAt: convertTimeStampToDate(comment.createdAt),
                updatedAt: convertTimeStampToDate(comment.updatedAt)
            }
        }) : []
    }

    async creationNewComment(data: Pick<CommentEntity,'postId' | 'userId' | 'content'>) : Promise<Empty> {
        await firstValueFrom(this.distCommentService.createNewComment(data))
        return new Empty()
    }

    async updationNewComment(data: Pick<CommentEntity, 'content' | 'id' | 'userId'>) : Promise<Empty> {
        await firstValueFrom(this.distCommentService.updateComment(data))
        return new Empty()
    }

    async deleteComment(data: Pick<CommentEntity, 'id' | 'userId'>): Promise<Empty> {
        console.log(data);
        
        await firstValueFrom(this.distCommentService.deleteComment(data))
        return new Empty()
    }
}