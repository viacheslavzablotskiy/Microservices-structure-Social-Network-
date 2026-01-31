import { HttpException, HttpStatus, Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { type ClientGrpc } from "@nestjs/microservices";
import {CommentReturnCount, convertDateToTimeStamp, convertTimeStampToDate, DistCommentService} from '@repo/proto'
import { CommentEntity, ReturnCommentTypeData } from "@repo/user-interfaces";
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


    async getInitialCommentData(data: {postId: number}): Promise<ReturnCommentTypeData[]> {
        try {
             const response = await firstValueFrom(this.distCommentService.getInitialCommentData(data))

             console.log(data);
             

            if (!response.comments) return []

            const {comments} = response

            return comments.map((comment) => {
                return {
                    ...comment,
                    createdAt: convertTimeStampToDate(comment.createdAt),
                    updatedAt: convertTimeStampToDate(comment.updatedAt)
                }
            })
        } catch (error) {
            throw new HttpException('Invalid data', HttpStatus.NOT_ACCEPTABLE, {
                cause: error
            })
        }
    } 

    async getOtherPartOfData(data: {postId: number, lastId: number}) : Promise<ReturnCommentTypeData[]> {
        try {
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
        } catch (error) {
            throw new HttpException('Invalid data', HttpStatus.NOT_ACCEPTABLE, {
                cause: error
            })
        }
    }

    async creationNewComment(data: Pick<CommentEntity,'postId' | 'userId' | 'content'>) : Promise<ReturnCommentTypeData> {
        const response = await firstValueFrom(this.distCommentService.createNewComment(data)).catch((error) => {
            throw new HttpException('Invalid data', HttpStatus.NOT_ACCEPTABLE, {
                cause: error
            })
        })
        return {
            ...response,
            createdAt: convertTimeStampToDate(response.createdAt),
            updatedAt: convertTimeStampToDate(response.updatedAt)
        }
    }

    async updationNewComment(data: Pick<CommentEntity, 'content' | 'id' | 'userId'>) : Promise<ReturnCommentTypeData> {
        const response = await firstValueFrom(this.distCommentService.updateComment(data)).catch((error) => {
            throw new HttpException('Invalid data', HttpStatus.NOT_ACCEPTABLE, {
                cause: error
            })
        })
        return {
            ...response,
            createdAt: convertTimeStampToDate(response.createdAt),
            updatedAt: convertTimeStampToDate(response.updatedAt)
        }
    }

    async deleteComment(data: Pick<CommentEntity, 'postId' | 'userId' | 'id'>): Promise<Empty> {
        try {
            await firstValueFrom(this.distCommentService.deleteComment(data))
            return new Empty()
        } catch (error) {
            throw new HttpException('Invalid data', HttpStatus.NOT_ACCEPTABLE, {
                cause: error
            })
        }
    }

    async getCountofComment(postIds: number[]): Promise<CommentReturnCount> {
        return firstValueFrom(this.distCommentService.getCountofLike({postIds: postIds})).catch((error) => {
            throw new HttpException('Invalid data', HttpStatus.NOT_ACCEPTABLE, {
                cause: error
            })
        })
    }
}

