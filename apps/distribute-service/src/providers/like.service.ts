import { HttpException, HttpStatus, Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { type ClientGrpc } from "@nestjs/microservices";
import {convertTimeStampToDate, DistLikeService, ReturnLikeCountData} from '@repo/proto'
import {Like_Entity } from "@repo/user-interfaces";
import {Empty} from 'google-protobuf/google/protobuf/empty_pb'
import { firstValueFrom } from "rxjs";


@Injectable()
export class LikeMainService implements OnModuleInit{
    private distLikeService: DistLikeService

    constructor(@Inject('DIST-LIKE-PATH') private client: ClientGrpc) {}

    onModuleInit() {
        this.distLikeService = this.client.getService<DistLikeService>('DistLikeService')
    }

    async creationNewLike(data: Omit<Like_Entity, 'createdAt' | 'id'>) : Promise<Empty> {
        try {
            await firstValueFrom(this.distLikeService.createNewLike(data))
            return new Empty()
        } catch (error) {
            throw new HttpException('Ivalid data', HttpStatus.NOT_ACCEPTABLE, {
                cause: error
            })
        }
    }

    async deletingLikes(data: {postId: number, userId: number}): Promise<Empty> {
        try {
            await firstValueFrom(this.distLikeService.deleteLike(data))
            return new Empty()
        } catch (error) {
            throw new HttpException('Invalid data', HttpStatus.NOT_ACCEPTABLE, {
                cause: error
            })
        }
    }

    async likeCountOfPost(postIds: number[], reqUser: number): Promise<ReturnLikeCountData> {
        return firstValueFrom(this.distLikeService.GetCountOfLike({postIds: postIds, reqUser: reqUser})).catch((error) => {
            throw new HttpException('Ivalid data', HttpStatus.NOT_ACCEPTABLE, {
                cause: error
            })
        })
    }
}