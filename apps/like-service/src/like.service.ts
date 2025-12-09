import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LikeEntity } from './entities/like.entity';
import { Repository } from 'typeorm';
import {type Like_Proto_Entity} from '@repo/user-interfaces'
import {convertDateToTimeStamp} from '@repo/proto'

@Injectable()
export class LikeService {

  constructor(@InjectRepository(LikeEntity) private readonly reposotoryLike: Repository<LikeEntity>) {}


  async createNewLike(data: Omit<Like_Proto_Entity, 'createdAt' | 'id'>): Promise<Like_Proto_Entity> {

    const validation = await this.reposotoryLike.findOne({
      where: {postId: data.postId, userId: data.userId
      }
    })

    if (validation) throw new BadRequestException('you have already like under this post') 

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

  async deleteLike(data: {postId: number, userId: number}): Promise<void> {
    const validation = await this.reposotoryLike.findOneBy({
      postId: data.postId, userId: data.userId
    })

    console.log(validation);
    

    if (!validation) throw new BadRequestException('there is not any like that you want to delete')

    await this.reposotoryLike.delete({postId: data.postId, userId: data.userId})
  }
  
}
