import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LikeEntity } from './entities/like.entity';
import { Repository } from 'typeorm';
import {type Like_Proto_Entity} from '@repo/user-interfaces'
import {convertDateToTimeStamp, ReturnLikeCountData} from '@repo/proto'
import {CacheService} from '@repo/chache-package'

@Injectable()
export class LikeService {

  constructor(
    @InjectRepository(LikeEntity) private readonly reposotoryLike: Repository<LikeEntity>,
    private readonly cacheService: CacheService
  ) {}


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
  
  async countLikesOfPost(postIds: number[], reqUserId: number): Promise<ReturnLikeCountData> {
    console.log(postIds);
    
      const response: {postId: number, isLiked: boolean, like: number}[] = await Promise.all(
        postIds.map(async (postId) => {
          const cacheKey = `postId:${postId}:like:count`
          const cached: {like: number, isLiked: boolean} | undefined = await this.cacheService.get<{like: number, isLiked: boolean}>(cacheKey)

          if (cached !== undefined) {
            return {postId: postId, ...cached}
          } else {
            const [firstValue, secondValue] = await Promise.all([
              this.reposotoryLike.find({where: {postId: postId}}),
              this.reposotoryLike.findOneBy({userId: reqUserId, postId: postId})
            ])

            const cachedData = {like: firstValue.length, isLiked: !!secondValue}
            this.cacheService.set(cacheKey, cachedData, 0)
            
            return {postId: postId, ...cachedData}
          }
        })
      )

      const resultObject = response.reduce<Record<number, {like: number, isLiked: boolean}>>((acc, {postId, isLiked, like}) => {
        acc[postId] = {like: like, isLiked: isLiked}
        return acc
      }, {})
      

      return {likes: resultObject}
  }

}
