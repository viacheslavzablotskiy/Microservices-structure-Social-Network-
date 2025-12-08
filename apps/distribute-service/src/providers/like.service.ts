import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { type ClientGrpc } from "@nestjs/microservices";
import {convertTimeStampToDate, DistLikeService} from '@repo/proto'
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

    // async creationOrDeletionLike(data: Omit<Like_Entity, 'createdAt' | 'id'>): Promise<{like?: Like_Entity, added: boolean}> {
    //     const response = await firstValueFrom(this.distLikeService.createOrDeleteLike(data))

    //     if (response.like) {
    //         return {
    //             ...response,
    //             like: {
    //                 ...response.like,
    //                 createdAt: convertTimeStampToDate(response.like.createdAt)
    //             }
    //         }
    //     } else {
    //         return {added: false}
    //     }

    // }

    async creationNewLike(data: Omit<Like_Entity, 'createdAt' | 'id'>) : Promise<Empty> {
        await firstValueFrom(this.distLikeService.createNewLike(data)) /// there we return whole LikeEntity
        return new Empty()
    }

    async deletingLikes(data: {id: number}): Promise<Empty> {
        await firstValueFrom(this.distLikeService.deleteLike(data))
        return new Empty()
    }
}