import { BadRequestException, Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PostEntity } from "src/entities/post.entity";
import {CretionNewPost, Post_Enitity_Proto} from '@repo/user-interfaces'
import { Repository } from "typeorm";
import convertFromPostToProto from "src/utils/convertToProto";
import { Empty } from "google-protobuf/google/protobuf/empty_pb";
import {ConnectionService} from '@repo/rabbitmq-package'
import * as amqp from 'amqplib'
import { ConfigService } from "@nestjs/config";

@Injectable()
export class CrudService implements OnModuleInit, OnModuleDestroy{
    private channel: amqp.ConfirmChannel

    constructor(
        @InjectRepository(PostEntity)
        private readonly repositoryPost: Repository<PostEntity>,
        private readonly configService: ConfigService,
        private readonly connectionService: ConnectionService
    ) {}


    async onModuleInit() {
        const conn = await this.connectionService.getConnection()
        this.channel = await conn.createConfirmChannel()
    }

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

        await this.connectionService.publish(this.channel,
        this.configService.get<string>('CACHE_EXCHANGE') || '',
        this.configService.get<string>('COMMENT_DEL_PAGE_ROUTING_KEY') || '',
        Buffer.from(JSON.stringify({postId: data.id})))
        await this.connectionService.publish(this.channel,
        this.configService.get<string>('CACHE_EXCHANGE') || '',
        this.configService.get<string>('COMMENT_DEL_COUNT_KEY') || '',
        Buffer.from(JSON.stringify({postId: data.id})))
        await this.connectionService.publish(this.channel,
        this.configService.get<string>('DELETE_COMMENTS_EXCHANGE') || '',
        this.configService.get<string>('DELETE_COMMENT_KEY') || '',
        Buffer.from(JSON.stringify({postId: data.id})))
        await this.connectionService.publish(this.channel,
        this.configService.get<string>('CACHE_EXCHANGE') || '',
        this.configService.get<string>('LIKE_COUNT_ROUTING_KEY') || '',
        Buffer.from(JSON.stringify({postId: data.id})))

        return new Empty()
    }

    async onModuleDestroy() {
        if (this.channel) {
            await this.channel.close()
        }
    }

}