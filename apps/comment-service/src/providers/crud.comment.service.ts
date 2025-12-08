import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CommentEnity_Proto } from "@repo/user-interfaces";
import { CommentEnity } from "src/entitis/comment.entity";
import { Repository } from "typeorm";
import {Empty} from 'google-protobuf/google/protobuf/empty_pb'



@Injectable()
export class CrudCommentService {

    constructor(@InjectRepository(CommentEnity) private readonly repositoryComment: Repository<CommentEnity>) {}


    async createNewComment(data: Omit<CommentEnity_Proto, 'createdAt' | 'updatedAt' | 'id'>): Promise<Empty> {
        const creationData = this.repositoryComment.create({
            userId: data.userId,
            postId: data.postId,
            content: data.content
        })

        const response = await this.repositoryComment.save(creationData)
        console.log(response);
        
        return new Empty()
    }
    
    async updateComment(data: Pick<CommentEnity_Proto, 'content' | 'id'>): Promise<Empty> {
        let currentComent = await this.repositoryComment.findOneBy(
            {id: data.id}
        )

        if (!currentComent) throw new BadRequestException('there is no comment with this id and post')
        
        currentComent.content = data.content

        await this.repositoryComment.save(currentComent)
        return new Empty()
    }

    async deleteComment(data: {id: number, postId: number}): Promise<Empty> {
        console.log(data);
        
        await this.repositoryComment.delete({
            id: data.id, postId: data.postId
        })
        return new Empty()
    }
}