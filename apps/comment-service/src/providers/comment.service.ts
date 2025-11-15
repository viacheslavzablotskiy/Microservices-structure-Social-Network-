import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEnity } from 'src/entitis/comment.entity';
import { MoreThan, Repository } from 'typeorm';
import {CommentEnity_Proto} from '@repo/user-interfaces'
import {convertCommentToProtoComment} from '../utils/convertCommentToProto'

@Injectable()
export class CommentService {

    constructor(@InjectRepository(CommentEnity) private readonly repositoryComment: Repository<CommentEnity>) {}


    async getInitialCommentData(data: {postId: number}): Promise<CommentEnity_Proto[]> {
      const initialData = await this.repositoryComment.find({
        where: {postId: data.postId},
        take: 20
      })

      return initialData.map((comment) => convertCommentToProtoComment(comment))
    }

    async getOtherPartComment(data: {postId: number, lastId: number}): Promise<CommentEnity_Proto[]> {
      const initialData = await this.repositoryComment.find({
        where: {postId: data.postId, id: MoreThan(data.lastId)},
        take: 20
      })

      return initialData.map((comment) => convertCommentToProtoComment(comment))
    }

}
