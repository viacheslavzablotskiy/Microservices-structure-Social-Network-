import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CommentEnity } from "src/entitis/comment.entity";
import { Repository } from "typeorm";



@Injectable()
export class EventCommentService {

    constructor(
        @InjectRepository(CommentEnity)
        private readonly commentRepository: Repository<CommentEnity>
    ) {}


    async deleteAllComment(data: {postId: number}): Promise<void> {
        
        this.commentRepository.delete({postId: data.postId})
    }
}

export default EventCommentService