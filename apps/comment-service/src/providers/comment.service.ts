import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEnity } from 'src/entitis/comment.entity';
import { MoreThan, Repository } from 'typeorm';
import {CommentEnity_Proto} from '@repo/user-interfaces'
import {convertCommentToProtoComment} from '../utils/convertCommentToProto'
import { ReturnCommentData } from '@repo/proto';

@Injectable()
export class CommentService {

    constructor(@InjectRepository(CommentEnity) private readonly repositoryComment: Repository<CommentEnity>) {}


    async getInitialCommentData(data: {postId: number}): Promise<ReturnCommentData> {
      const initialData = await this.repositoryComment.find({
        where: {postId: data.postId},
        take: 20
      })
      
      const response = initialData.length === 0 ? [] :initialData.map((comment) => convertCommentToProtoComment(comment))
      console.log(response);
      
      return {comments: response}
    }

    async getOtherPartComment(data: {postId: number, lastId: number}): Promise<ReturnCommentData> {
      const initialData = await this.repositoryComment.find({
        where: {postId: data.postId, id: MoreThan(data.lastId)},
        take: 20
      })

      const response = initialData.length === 0 ? [] : initialData.map((comment) => convertCommentToProtoComment(comment))

      return {comments: response}
    }

}
