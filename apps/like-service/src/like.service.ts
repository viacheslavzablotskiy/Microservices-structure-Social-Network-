import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LikeEntity } from './entities/like.entity';
import { Repository } from 'typeorm';
import {type Like_Proto_Entity} from '@repo/user-interfaces'
import {convertDateToTimeStamp} from '@repo/proto'

@Injectable()
export class LikeService {

  constructor(@InjectRepository(LikeEntity) private readonly reposotoryLike: Repository<LikeEntity>) {}


  async createNewLike(data: Omit<Like_Proto_Entity, 'createdAt' | 'id'>): Promise<Like_Proto_Entity> {
    const creationData = this.reposotoryLike.create({
      postId: data.postId,
      userId: data.userId
    })

    const {createdAt, ...otherData} = await this.reposotoryLike.save(creationData)

    return {
      ...otherData,
      createdAt: convertDateToTimeStamp(createdAt)
    }
  }

  async deleteLike(data: {id: number}): Promise<void> {
    await this.reposotoryLike.delete(data.id)
  }
  
}
