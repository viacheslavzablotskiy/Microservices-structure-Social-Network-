import { Controller, Get, UseFilters, UseInterceptors } from '@nestjs/common';
import { CommentService } from '../providers/comment.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CommentEnity_Proto } from '@repo/user-interfaces';
import { CrudCommentService } from '../providers/crud.comment.service';
import {Empty} from 'google-protobuf/google/protobuf/empty_pb'
import { CommentReturnCount, ReturnCommentData } from '@repo/proto';
import {RpcExceptionFilter} from '@repo/api'
import { CacheInterceptorPage } from 'src/settings/main.interceptors';

@Controller()
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly crudCommentService: CrudCommentService
  ) {}

    
  @GrpcMethod('DistCommentService', 'GetInitialCommentData')
  @UseFilters(RpcExceptionFilter)
  @UseInterceptors(CacheInterceptorPage)
  async getInitialCommentData(data: {postId: number}): Promise<ReturnCommentData> {
    try {
      return await this.commentService.getInitialCommentData(data)
    } catch (error) {
      if (error instanceof RpcException) {
        throw new RpcException(error.getError())
      } else throw new Error(error)
    }
  }

  @GrpcMethod('DistCommentService', 'GetOtherCommentData')
  @UseFilters(RpcExceptionFilter)
  async getOtherCommentData(data: {postId: number, lastId: number}): Promise<ReturnCommentData> {
    try {
      return await this.commentService.getOtherPartComment(data)
    } catch (error) {
      if (error instanceof RpcException) {
        throw new RpcException(error.getError())
      } else throw new Error(error)
    }
  }

  @GrpcMethod('DistCommentService', 'CreateNewComment')
  @UseFilters(RpcExceptionFilter)
  async createNewComment(data: Omit<CommentEnity_Proto, 'createdAt' | 'updatedAt' | 'id'>) : Promise<CommentEnity_Proto> {
    try {
      return await this.crudCommentService.createNewComment(data)
    } catch (error) {
      if (error instanceof RpcException) {
        throw new RpcException(error.getError())
      } else throw new Error(error)
    }
  }

  @GrpcMethod('DistCommentService', 'UpdateComment')
  @UseFilters(RpcExceptionFilter)
  async updateComment(data: Omit<CommentEnity_Proto, 'createdAt' | 'updatedAt' | 'postId'>): Promise<CommentEnity_Proto> {
    try {
      return await this.crudCommentService.updateComment(data)
    } catch (error) {
      if (error instanceof RpcException) {
        throw new RpcException(error.getError())
      } else throw new Error(error)
    }
  }

  @GrpcMethod('DistCommentService', 'DeleteComment')
  @UseFilters(RpcExceptionFilter)
  async deleteComment(data: {id: number, userId: number, postId: number}) : Promise<Empty> {
    try {
      console.log(data);
      return await this.crudCommentService.deleteComment(data)
    } catch (error) {
      if (error instanceof RpcException) {
        throw new RpcException(error.getError())
      } else throw new Error(error)
    }
  }

  @GrpcMethod('DistCommentService', 'GetCountofLike')
  @UseFilters(RpcExceptionFilter)
  async getCountofLike(data: {postIds: number[]}) : Promise<CommentReturnCount> {  
    try {
      return await this.commentService.getCountofComment(data.postIds)
    } catch (error) {
      if (error instanceof RpcException) {
        throw new RpcException(error.getError())
      } else throw new Error(error)
    }
  }
  
}
