import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LikeEntity } from './entities/like.entity';
import { DataSource, In, Repository } from 'typeorm';
import {type Like_Proto_Entity} from '@repo/user-interfaces'
import {convertDateToTimeStamp, ReturnLikeCountData} from '@repo/proto'
import {CacheService} from '@repo/chache-package'
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class LikeService {

  constructor(
    @InjectRepository(LikeEntity) private readonly reposotoryLike: Repository<LikeEntity>,
    private readonly cacheService: CacheService,
    @Inject('DELETE_LIKE_COUNT_CACHE') private readonly clientDeleteLikeCount: ClientProxy
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

    try {
        await this.reposotoryLike.delete({postId: data.postId, userId: data.userId})
        this.clientDeleteLikeCount.emit('like.count.key', {postId: validation.postId})
    } catch (error) {

    }
  }
  
  // async countLikesOfPost(postIds: number[], reqUserId: number): Promise<ReturnLikeCountData> {
  //   console.log(postIds);
    
  //     const response: {postId: number, isLiked: boolean, like: number}[] = await Promise.all(
  //       postIds.map(async (postId) => {
  //         const cacheKey = `postId:${postId}:like:count`
  //         const cached: {like: number} | undefined = await this.cacheService.get<{like: number}>(cacheKey)

  //         if (cached !== undefined) {
  //           const response = await this.reposotoryLike.findOneBy({userId: reqUserId, postId: postId})
  //           return {postId: postId, ...cached, isLiked: !!response}
  //         } else {
  //           const [firstValue, secondValue] = await Promise.all([
  //             this.reposotoryLike.find({where: {postId: postId}}),
  //             this.reposotoryLike.findOneBy({userId: reqUserId, postId: postId})
  //           ])

  //           const cachedData = {like: firstValue.length}
  //           this.cacheService.set(cacheKey, {like: cachedData.like}, 0)
            
  //           return {postId: postId, ...cachedData, isLiked: !!secondValue}
  //         }
  //       })
  //     )

  //     const resultObject = response.reduce<Record<number, {like: number, isLiked: boolean}>>((acc, {postId, isLiked, like}) => {
  //       acc[postId] = {like: like, isLiked: isLiked}
  //       return acc
  //     }, {})
      

  //     return {likes: resultObject}
  // }


  async countLikesOfPost(postIds: number[], reqUser: number): Promise<ReturnLikeCountData> {
    const cachedCount: Record<number, number> = {}
    const missingPostIds: number[] = []

    for (const postId of postIds) {
      const cacheKey = `postId:${postId}:like:count`
      const cached = await this.cacheService.get<{like: number}>(cacheKey)
      if (cached !== undefined) {
        cachedCount[postId] = cached.like
      } else {
        missingPostIds.push(postId)
      }
    }

    if (missingPostIds.length > 0) {
      const likesGrouped: {postId: string, count: string}[] = await this.reposotoryLike
      .createQueryBuilder('like')
      .select('like.postId', 'postId')
      .addSelect('COUNT(*)', 'count')
      .where('like.postId IN (:...missingPostIds)', {missingPostIds})
      .groupBy('like.postId')
      .getRawMany()

      console.log(likesGrouped);
      

      await Promise.all(
        likesGrouped.map(({postId, count}) => {
          cachedCount[Number(postId)] = Number(count)
          const cacheKey = `postId:${Number(postId)}:like:count`
          return this.cacheService.set(cacheKey, {like: Number(count)}, 0)
        })
      )
    }

    const userLikes = await this.reposotoryLike.find({
      where: {userId: reqUser, postId: In(postIds)}
    })
    const likedSet = new Set(userLikes.map(like => like.postId))

    console.log(cachedCount);
    

    const resultObject: Record<number, {like: number, isLiked: boolean}> = {};
    for (const postId of postIds) {
      resultObject[postId] = {
        like: cachedCount[postId] ?? 0,
        isLiked: likedSet.has(postId)
      }
    }

    console.log(resultObject);
    
    return {likes: resultObject}
  }
 

}
