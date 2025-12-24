import { BadRequestException, Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LikeEntity } from '../entities/like.entity';
import { DataSource, In, Repository } from 'typeorm';
import {Post_Enitity_Proto, type Like_Proto_Entity} from '@repo/user-interfaces'
import {convertDateToTimeStamp, ReturnLikeCountData} from '@repo/proto'
import {CacheService} from '@repo/chache-package'
import {ConnectionService} from '@repo/rabbitmq-package'
import * as amqp from 'amqplib'
import { ConfigService } from '@nestjs/config';


const KeyRouting = {
  DELETE_POST_PAGE_CACHE: 'POST_PAGE_CACHE_ROUTING_KEY',
  LIKE_COUNT_CACHE: 'LIKE_COUNT_ROUTING_KEY'
} as const
type RountingKeysValues = keyof typeof KeyRouting
type PayloadMap = {
  DELETE_POST_PAGE_CACHE: '',
  LIKE_COUNT_CACHE: {postId: number}
}
type Payload<K extends RountingKeysValues> = PayloadMap[K]

@Injectable()
export class LikeService implements OnModuleInit, OnModuleDestroy{
  private channel: amqp.ConfirmChannel
  private exchangeName: string 
  private routingsKeys: Record<RountingKeysValues, string>
  private postPageRedisKey: string
  constructor(
    @InjectRepository(LikeEntity) private readonly reposotoryLike: Repository<LikeEntity>,
    private readonly cacheService: CacheService,
    private readonly connectionService: ConnectionService ,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const conn = await this.connectionService.getConnection()
    this.channel = await conn.createConfirmChannel()
    this.exchangeName = this.configService.get<string>('CACHE_EXCHANGE') || ''

    this.postPageRedisKey = this.configService.get<string>('CACHE_KEY_POST_PAGE1') || '' 

    this.routingsKeys = {
      DELETE_POST_PAGE_CACHE: this.configService.get<string>('POST_PAGE_CACHE_ROUTING_KEY') || '',
      LIKE_COUNT_CACHE: this.configService.get<string>('LIKE_COUNT_ROUTING_KEY') || ''
    }
  }

  async safePublish<K extends RountingKeysValues>(routingKey: K, payload: Payload<K>) {
    try {
      await this.connectionService.publish(this.channel, this.exchangeName, this.routingsKeys[routingKey], payload)
    } catch (error) {
      throw new Error('error occured by this reason: ', error)
    }
  }

  async createNewLike(data: Omit<Like_Proto_Entity, 'createdAt' | 'id'>): Promise<Like_Proto_Entity> {

    try {
      const creationData = this.reposotoryLike.create({
      postId: data.postId,
      userId: data.userId
    })
    const {createdAt, ...otherData} = await this.reposotoryLike.save(creationData)

    const firstPage = await this.cacheService.get<Post_Enitity_Proto[]>(this.postPageRedisKey)
    const inFirstPage = firstPage?.some((post) => {return post.id === otherData.postId}) ?? false

    const task = [
      this.safePublish('LIKE_COUNT_CACHE', {postId: otherData.postId})
    ]
    if (inFirstPage) task.push(this.safePublish('DELETE_POST_PAGE_CACHE', ''))

    const result = await Promise.allSettled([task]) 
    result.forEach((task) => {
      if (task.status === 'rejected') console.error(task.reason);
    })


    return {
      ...otherData,
      createdAt: convertDateToTimeStamp(createdAt)
    }
    } catch (error) {
        if (error.code === '23505') {
          throw new BadRequestException('you already have like')
        }
        throw error
    }
  
  }

  async deleteLike(data: {postId: number, userId: number}): Promise<void> {
    try {
        const response = await this.reposotoryLike.delete({postId: data.postId, userId: data.userId})

        if (response.affected === 0) {
          throw new BadRequestException('there is any like to delete')
        }

        const firstPage = await this.cacheService.get<Post_Enitity_Proto[]>(this.postPageRedisKey)
        const isInFirstPage = firstPage?.some((post) => {return post.id === data.postId}) ?? false
        const task = [
            this.safePublish('LIKE_COUNT_CACHE', {postId: data.postId})
        ]
        if (isInFirstPage) task.push(this.safePublish('LIKE_COUNT_CACHE', {postId: data.postId}))

        const result = await Promise.allSettled([task])

        result.forEach((value) => {
          if (value.status === 'rejected') console.error('task failed', value.reason);
        })
        
    } catch (error) {
        console.error(error);
    }
  }

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

      const foundIds = new Set(likesGrouped.map(record => Number(record.postId)))

      await Promise.all([
        likesGrouped.map(({postId, count}) => {
          cachedCount[Number(postId)] = Number(count)
          const cacheKey = `postId:${Number(postId)}:like:count`
          console.log('hello');
          return this.cacheService.set(cacheKey, {like: Number(count)}, 0)
        }),
        missingPostIds.filter(postId => !foundIds.has(postId)).map(postId => {
          cachedCount[Number(postId)] = 0;
          const cacheKey = `postId:${Number(postId)}:like:count`
          return this.cacheService.set(cacheKey, {like: 0}, 0)
        })
      ])
    }

    const userLikes = await this.reposotoryLike.find({
      where: {userId: reqUser, postId: In(postIds)}
    })
    const likedSet = new Set(userLikes.map(like => like.postId))

    const resultObject: Record<number, {like: number, isLiked: boolean}> = {};
    for (const postId of postIds) {
      resultObject[postId] = {
        like: cachedCount[postId] ?? 0,
        isLiked: likedSet.has(postId)
      }
    }
    return {likes: resultObject}
  }
 
  async onModuleDestroy() {
    if (this.channel) {
      await this.channel.close()
    }
  }

}
