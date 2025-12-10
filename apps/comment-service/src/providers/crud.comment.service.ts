import { BadRequestException, Injectable, NotAcceptableException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CommentEnity_Proto } from "@repo/user-interfaces";
import { CommentEnity } from "src/entitis/comment.entity";
import { Repository } from "typeorm";
import {Empty} from 'google-protobuf/google/protobuf/empty_pb'
import { CacheService } from "@repo/chache-package";
import { convertDateToTimeStamp } from "@repo/proto";


@Injectable()
export class CrudCommentService {

    constructor(@InjectRepository(
        CommentEnity) private readonly repositoryComment: Repository<CommentEnity>,
        private readonly cacheService: CacheService
    ) {}


    async createNewComment(data: Omit<CommentEnity_Proto, 'createdAt' | 'updatedAt' | 'id'>): Promise<CommentEnity_Proto> {
        const creationData = this.repositoryComment.create({
            userId: data.userId,
            postId: data.postId,
            content: data.content
        })

        const response = await this.repositoryComment.save(creationData)
        console.log(response);
        
        return {
            ...response,
            createdAt: convertDateToTimeStamp(response.createdAt),
            updatedAt: convertDateToTimeStamp(response.updatedAt)
        }
    }
    
    async updateComment(data: Pick<CommentEnity_Proto, 'content' | 'id' | 'userId' >): Promise<CommentEnity_Proto> {
        const cacheKey = `commentId:${data.id}`
        const cached: CommentEnity | undefined = await this.cacheService.get(cacheKey)
        
        if (cached) {
            if (cached.userId !== data.userId) throw new UnauthorizedException('you dont have permission')
            cached.content = data.content
            const response = await this.repositoryComment.save({
                ...cached,
                createdAt: new Date(cached.createdAt),
                updatedAt: new Date(cached.updatedAt)
            })
            await this.cacheService.del(cacheKey)
            return {
                ...response,
                createdAt: convertDateToTimeStamp(response.createdAt),
                updatedAt: convertDateToTimeStamp(response.updatedAt)
            }
        } 
        
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
        
        await this.repositoryComment.delete({
            id: data.id, userId: data.userId
        })
        return new Empty()
    }
}