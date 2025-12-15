import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PostEntity } from "src/entities/post.entity";
import {CretionNewPost, Post_Enitity_Proto} from '@repo/user-interfaces'
import { Repository } from "typeorm";
import convertFromPostToProto from "src/utils/convertToProto";
import { Empty } from "google-protobuf/google/protobuf/empty_pb";
import { ClientProxy } from "@nestjs/microservices";
import { readonly } from "zod";


@Injectable()
export class CrudService  {

    constructor(
        @InjectRepository(PostEntity)
        private readonly repositoryPost: Repository<PostEntity>,
        @Inject('DELETE_COMMENTS')
        private readonly clientDeleteComment: ClientProxy,
        @Inject('DELETE_COMMENT_COUNT_CACHE')
        private readonly clientDeleteCommentCountCache: ClientProxy,
        @Inject('DELETE_LIKE_COUNT_CACHE')
        private readonly clientDeleteLikeCountCache: ClientProxy,
        @Inject('DELETE_LIKE_COUNT_CACHE') private readonly clientDeleteCachePage: ClientProxy,
    ) {}

    async handleNewPost(data: CretionNewPost): Promise<Post_Enitity_Proto> {
        const creationData = this.repositoryPost.create({
            userId: data.userId,
            title: data.title,
            imageUrl: data.imageUrl,
            content: data.content
        })

        const response = await this.repositoryPost.save(creationData)

        return convertFromPostToProto(response)
    }

    async updatePost(data: Partial<Omit<Post_Enitity_Proto, 'createdAt' | 'updatedAt' | 'id' | 'userId'>>
        & Pick<Post_Enitity_Proto, 'id' | 'userId'>
    ): Promise<Post_Enitity_Proto> {
        const {id, userId, ...otherData} = data

        if (!id) throw new BadRequestException('in this data we dotn convey id')
        
        const currentPost = await this.repositoryPost.findOneBy({id: id})
        console.log(currentPost);
        

        if (!currentPost ||
            currentPost?.userId !== userId)
            throw new BadRequestException('you dont have permission or we dont have post with this id')

        Object.assign(currentPost, otherData)

        console.log(currentPost);
        
        
        const resultPost = await this.repositoryPost.save(currentPost)

        return convertFromPostToProto(resultPost)

    }

    async deletePost(data: {id: number, userId: number}): Promise<Empty> {
        
        const validation = await this.repositoryPost.findOneBy({
            id: data.id, userId: data.userId
        })

        if (!validation) throw new BadRequestException('you dont have the permission or we dont have this post')

        await this.repositoryPost.delete(data.id)

        this.clientDeleteComment.emit('comments_key', {postId: data.id})
        this.clientDeleteCommentCountCache.emit('comment.count.key', {postId: data.id})
        this.clientDeleteLikeCountCache.emit('like.count.key', {postId: data.id})
        this.clientDeleteCachePage.emit('comment.page.key', {postId: data.id})

        return new Empty()
    }

}