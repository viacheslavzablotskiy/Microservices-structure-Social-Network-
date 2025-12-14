import { Controller, Get } from '@nestjs/common';
import { CommentService } from '../providers/comment.service';
import { GrpcMethod } from '@nestjs/microservices';
import { CommentEnity_Proto } from '@repo/user-interfaces';
import { CrudCommentService } from '../providers/crud.comment.service';
import {Empty} from 'google-protobuf/google/protobuf/empty_pb'
import { CommentReturnCount, ReturnCommentData } from '@repo/proto';

@Controller()
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly crudCommentService: CrudCommentService
  ) {}

    
  @GrpcMethod('DistCommentService', 'GetInitialCommentData')
  async getInitialCommentData(data: {postId: number}): Promise<ReturnCommentData> {
    return await this.commentService.getInitialCommentData(data)
  }

  @GrpcMethod('DistCommentService', 'GetOtherCommentData')
  async getOtherCommentData(data: {postId: number, lastId: number}): Promise<ReturnCommentData> {
    return await this.commentService.getOtherPartComment(data)
  }

  @GrpcMethod('DistCommentService', 'CreateNewComment')
  async createNewComment(data: Omit<CommentEnity_Proto, 'createdAt' | 'updatedAt' | 'id'>) : Promise<CommentEnity_Proto> {
    return await this.crudCommentService.createNewComment(data)
  }

  @GrpcMethod('DistCommentService', 'UpdateComment')
  async updateComment(data: Omit<CommentEnity_Proto, 'createdAt' | 'updatedAt' | 'postId'>): Promise<CommentEnity_Proto> {
    return await this.crudCommentService.updateComment(data)
  }

  @GrpcMethod('DistCommentService', 'deleteComment')
  async deleteComment(data: {id: number, userId: number}) : Promise<Empty> {
    return await this.crudCommentService.deleteComment(data)
  }

  @GrpcMethod('DistCommentService', 'GetCountofLike')
  async getCountofLike(data: {postIds: number[]}) : Promise<CommentReturnCount> {  
    return await this.commentService.getCountofComment(data.postIds)
  }
  
}
