import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { type ClientGrpc } from "@nestjs/microservices";
import {convertTimeStampToDate, DistPostService} from '@repo/proto'
import { Post_Entity } from "@repo/user-interfaces";
import { firstValueFrom } from "rxjs";
import {Empty} from 'google-protobuf/google/protobuf/empty_pb'

@Injectable()
export class MainPostService implements OnModuleInit{
    private distPostService: DistPostService

    constructor(@Inject('DIST-POST-PATH') private client: ClientGrpc) {}

    onModuleInit() {
        this.distPostService = this.client.getService<DistPostService>('DistPostService')
    }


    async getInitialPostsData(): Promise<Post_Entity[]> {
        const response = await firstValueFrom(this.distPostService.getInitialPosts({})) ///there we need change

        return response.map((post) => {
            return {
                ...post,
                createdAt: convertTimeStampToDate(post.createdAt),
                updatedAt: convertTimeStampToDate(post.updatedAt)
            }
        })
    }

    async getOtherPartOfData(data: {lastId: number}): Promise<Post_Entity[]> {
        const response = await firstValueFrom(this.distPostService.getSomePartPosts(data))

        return response.map((post) => {
            return {
                ...post,
                createdAt: convertTimeStampToDate(post.createdAt),
                updatedAt: convertTimeStampToDate(post.updatedAt)
            }
        })
    }

    async creationNewPost(data: Omit<Post_Entity, 'createdAt' | 'updatedAt' | 'id'>) : Promise<Empty> {
        await firstValueFrom(this.distPostService.createNewPost(data))
        return new Empty()
    }

    async updatePost(data: Partial<Omit<Post_Entity, 'createdAt' | 'updatedAt' | 'id'>>) : Promise<Empty> {
        await firstValueFrom(this.distPostService.updatePost(data)) /// there we return Post_Entity_Proto
        return new Empty()
    }

    async deletePost(data: {id: number}): Promise<Empty> {
        await firstValueFrom(this.distPostService.deletePost(data)) /// there we need add RabbitMq method to delete all comments and likes
        /// via async, and fire-forget
        return new Empty()
    }
}