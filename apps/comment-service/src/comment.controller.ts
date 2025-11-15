import { Controller, Get } from '@nestjs/common';
import { CommentService } from './providers/comment.service';
import { GrpcMethod } from '@nestjs/microservices';
import { CommentEnity_Proto } from '@repo/user-interfaces';
import { CrudCommentService } from './providers/crud.comment.service';
import {Empty} from 'google-protobuf/google/protobuf/empty_pb'

@Controller()
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly crudCommentService: CrudCommentService
  ) {}

    
  @GrpcMethod('DistCommentService', 'GetInitialCommentData')
  async getInitialCommentData(data: {postId: number}): Promise<CommentEnity_Proto[]> {
    return await this.commentService.getInitialCommentData(data)
  }

  @GrpcMethod('DistCommentService', 'GetOtherCommentData')
  async getOtherCommentData(data: {postId: number, lastId: number}): Promise<CommentEnity_Proto[]> {
    return await this.commentService.getOtherPartComment(data)
  }

  @GrpcMethod('DistCommentService', 'CreateNewComment')
  async createNewComment(data: Omit<CommentEnity_Proto, 'createdAt' | 'updatedAt' | 'id'>) : Promise<Empty> {
    return await this.crudCommentService.createNewComment(data)
  }

  @GrpcMethod('DistCommentService', 'UpdateComment')
  async updateComment(data: Omit<CommentEnity_Proto, 'createdAt' | 'updatedAt' | 'userId'>): Promise<Empty> {
    return await this.crudCommentService.updateComment(data)
  }

  @GrpcMethod('DistCommentService', 'deleteComment')
  async deleteComment(data: {id: number, postId: number}) : Promise<Empty> {
    return await this.crudCommentService.deleteComment(data)
  }
  
}
