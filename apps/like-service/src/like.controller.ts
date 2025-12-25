import { Controller, Get, UseFilters } from '@nestjs/common';
import { LikeService } from './providers/like.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { Like_Proto_Entity } from '@repo/user-interfaces';
import { Empty } from "google-protobuf/google/protobuf/empty_pb";
import { ReturnLikeCountData } from '@repo/proto';
import {RpcExceptionFilter} from '@repo/api'


@Controller()
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @GrpcMethod('DistLikeService', 'createNewLike')
  @UseFilters(new RpcExceptionFilter())
  async createNewLike(data: Omit<Like_Proto_Entity, 'createdAt'>): Promise<Like_Proto_Entity> {
    try {
      return await this.likeService.createNewLike(data)
    } catch (error) {
      if (error instanceof RpcException) {
        throw new RpcException(error.getError())
      } else throw new Error(error)
    }
  }
  
  @GrpcMethod('DistLikeService', 'DeleteLike')
  @UseFilters(new RpcExceptionFilter())
  async deleteLike(data: {postId: number, userId: number}) : Promise<Empty> {
    try {
      await this.likeService.deleteLike(data)
      return new Empty()
    } catch (error) { 
      if (error instanceof RpcException) {
        throw new RpcException(error.getError())
      } else throw Error(error)
    }
  }


  @GrpcMethod('DistLikeService', 'GetCountOfLike')
  @UseFilters(new RpcExceptionFilter())
  async getCountofLikes(data: {postIds: number[], reqUser: number}): Promise<ReturnLikeCountData> {
    try {
      return await this.likeService.countLikesOfPost(data.postIds, data.reqUser)
    } catch (error) {
      if (error instanceof RpcException) {
        throw new RpcException(error.getError())
      } else throw new Error(error)
    }
  }
}
