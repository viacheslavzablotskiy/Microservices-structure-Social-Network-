import { Controller, Get } from '@nestjs/common';
import { LikeService } from './providers/like.service';
import { GrpcMethod } from '@nestjs/microservices';
import { Like_Proto_Entity } from '@repo/user-interfaces';
import { Empty } from "google-protobuf/google/protobuf/empty_pb";
import { ReturnLikeCountData } from '@repo/proto';


@Controller()
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @GrpcMethod('DistLikeService', 'createNewLike')
  async createNewLike(data: Omit<Like_Proto_Entity, 'createdAt'>): Promise<Like_Proto_Entity> {
    return await this.likeService.createNewLike(data)
  }
  
  @GrpcMethod('DistLikeService', 'DeleteLike')
  async deleteLike(data: {postId: number, userId: number}) : Promise<Empty> {
    await this.likeService.deleteLike(data)
    return new Empty()
  }


  @GrpcMethod('DistLikeService', 'GetCountOfLike')
  async getCountofLikes(data: {postIds: number[], reqUser: number}): Promise<ReturnLikeCountData> {
    return await this.likeService.countLikesOfPost(data.postIds, data.reqUser)
  }
}
