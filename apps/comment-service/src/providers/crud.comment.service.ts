import { BadRequestException, Inject, Injectable, NotAcceptableException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CommentEnity_Proto } from "@repo/user-interfaces";
import { CommentEnity } from "src/entitis/comment.entity";
import { Repository } from "typeorm";
import {Empty} from 'google-protobuf/google/protobuf/empty_pb'
import { convertDateToTimeStamp } from "@repo/proto";
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class CrudCommentService {

    constructor(@InjectRepository(
        CommentEnity) private readonly repositoryComment: Repository<CommentEnity>,
        @Inject('DELETE_COMMENT_COUNT_CACHE')
        private clientDeleteCountCache: ClientProxy,
        @Inject('DELETE_CACHE_PAGE_1')
        private readonly clientDeleteCachePage: ClientProxy
    ) {}


    async createNewComment(data: Omit<CommentEnity_Proto, 'createdAt' | 'updatedAt' | 'id'>): Promise<CommentEnity_Proto> {
        const creationData = this.repositoryComment.create({
            userId: data.userId,
            postId: data.postId,
            content: data.content
        })

       let response: CommentEnity;

       
        try {
            response = await this.repositoryComment.save(creationData)
            console.log(response);
            
            this.clientDeleteCachePage.emit('comment.page.key', {postId: response.postId})
            this.clientDeleteCountCache.emit('comment.count.key', {postId: response.postId})

        } catch (error) {
            throw new BadRequestException(error)
        }

        if (!response) throw new BadRequestException('data for creation is not valid')

        return {
            ...response,
            createdAt: convertDateToTimeStamp(response.createdAt),
            updatedAt: convertDateToTimeStamp(response.updatedAt)
        }
    }
    
    async updateComment(data: Pick<CommentEnity_Proto, 'content' | 'id' | 'userId' >): Promise<CommentEnity_Proto> {
        
        let currentComent = await this.repositoryComment.findOneBy(
            {id: data.id}
        )
        
        if (!currentComent) throw new BadRequestException('there is no comment with this id and post') 
        if (currentComent.userId !== data.userId) throw new NotAcceptableException('you dont have permission to delete this')
        
        console.log(currentComent.userId === data.userId);
        
        currentComent.content = data.content

        const response = await this.repositoryComment.save(currentComent)
        return {
            ...response,
            createdAt: convertDateToTimeStamp(response.createdAt),
            updatedAt: convertDateToTimeStamp(response.updatedAt)
        }
    }

    async deleteComment(data: {id: number, userId: number}): Promise<Empty> {
        
        const validation = await this.repositoryComment.findOneBy({
            userId: data.userId, id: data.id
        })

        if (!validation) throw new BadRequestException('there is not comment or you dont have permission')
        
        try {
            await this.repositoryComment.delete({
            id: data.id, userId: data.userId
        })
            this.clientDeleteCountCache.emit('comment.count.key', {postId: validation.postId})
            this.clientDeleteCachePage.emit('comment.page.key', {postId: validation.postId})

        } catch (error) {
            
        }

        return new Empty()
    }
}