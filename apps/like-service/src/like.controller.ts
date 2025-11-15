import { Controller, Get } from '@nestjs/common';
import { LikeService } from './like.service';
import { GrpcMethod } from '@nestjs/microservices';
import { Like_Proto_Entity } from '@repo/user-interfaces';
import { Empty } from "google-protobuf/google/protobuf/empty_pb";

@Controller()
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @GrpcMethod('DistLikeService', 'createNewLike')
  async createNewLike(data: Omit<Like_Proto_Entity, 'createdAt'>): Promise<Like_Proto_Entity> {
    return await this.likeService.createNewLike(data)
  }
  
  @GrpcMethod('DistLikeService', 'DeleteLike')
  async deleteLike(data: {id: number}) : Promise<Empty> {
    await this.likeService.deleteLike(data)
    return new Empty()
  }
}
