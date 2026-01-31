import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEnity } from 'src/entitis/comment.entity';
import { LessThan, MoreThan, Repository } from 'typeorm';
import {CommentEnity_Proto} from '@repo/user-interfaces'
import {convertCommentToProtoComment} from '../utils/convertCommentToProto'
import { CommentReturnCount, DistUserService, ReturnCommentData } from '@repo/proto';
import { CacheService } from '@repo/chache-package'; 
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CommentService implements OnModuleInit {
    private distUserService: DistUserService

    constructor(
      @InjectRepository(CommentEnity) 
      private readonly repositoryComment: Repository<CommentEnity>,
      private readonly cacheService: CacheService,
      @Inject('DIST-USER-PATH') private readonly client: ClientGrpc
    ) {}

    onModuleInit() {
      this.distUserService = this.client.getService<DistUserService>('DistUserService')
    }


    async getInitialCommentData(data: {postId: number}): Promise<ReturnCommentData> {
      const cacheKey = `comments:post:${data.postId}:page:1`

      const initialData = await this.repositoryComment.find({
        where: {postId: data.postId},
        take: 20,
        order: {id: 'DESC'}
      })

      const userIds = [...new Set(initialData.map(comment => comment.id))]
      const userData = await firstValueFrom(this.distUserService.getBatchData(userIds))

      const response = initialData.length === 0 ? [] : initialData.map((comment) => convertCommentToProtoComment(comment))
      await this.cacheService.set(cacheKey, response, 0)
      return {comments: response.map(comment => {
        return {
          ...comment,
          userData: userData[comment.userId]
        }
      })}
    }

    async getOtherPartComment(data: {postId: number, lastId: number}): Promise<ReturnCommentData> {
      const initialData = await this.repositoryComment.find({
        where: {postId: data.postId, id: LessThan(data.lastId)},
        take: 20,
        order: {id: 'DESC'}
      })

      const userIds = [...new Set(initialData.map(comment => comment.id))]
      const userData = await firstValueFrom(this.distUserService.getBatchData(userIds))

      const response = initialData.length === 0 ? [] : initialData.map((comment) => convertCommentToProtoComment(comment))

      return {comments: response.map((comment) => {
        return {
          ...comment,
          userData: userData[comment.userId]
        }
      })}
    }
    
    async getCountofComment(postIds: number[]): Promise<CommentReturnCount> {
      const cacheData: Record<number, number> = {}
      const missingIds: number[] = []

      for (const postId of postIds) {
        const cache: number | undefined = await this.cacheService.get(`comments:post:${postId}:count`)
        if (cache !== undefined) {
            cacheData[postId] = cache
        } else {
          missingIds.push(postId)
        }
      }

      if (missingIds.length > 0) {
        const response: {postId: string, count: string}[] = await this.repositoryComment
        .createQueryBuilder('comment')
        .select('comment.postId', 'postId')
        .addSelect('COUNT(*)', 'count')
        .where('comment.postId IN (:...missingIds)', {missingIds})
        .groupBy('comment.postId')
        .getRawMany()

        const newSet = new Set(response.map(data => Number(data.postId)))

        await Promise.all([
            response.map(({postId, count}) => {
              cacheData[Number(postId)] = Number(count)
              const cacheKey = `comments:post:${Number(postId)}:count`
              return this.cacheService.set(cacheKey, Number(count), 0)
            }),
            missingIds.filter(id => !newSet.has(id)).map((postId) => {
              cacheData[Number(postId)] = 0
              const cacheKey = `comments:post:${Number(postId)}:count`
              return this.cacheService.set(cacheKey, 0, 0)
            })
        ])
      }

      console.log(cacheData);
      

      return {comments: cacheData}

    }
}
