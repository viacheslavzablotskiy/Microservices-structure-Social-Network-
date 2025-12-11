import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEnity } from 'src/entitis/comment.entity';
import { MoreThan, Repository } from 'typeorm';
import {CommentEnity_Proto} from '@repo/user-interfaces'
import {convertCommentToProtoComment} from '../utils/convertCommentToProto'
import { CommentReturnCount, ReturnCommentData } from '@repo/proto';
import { CacheService } from '@repo/chache-package';

@Injectable()
export class CommentService {

    constructor(
      @InjectRepository(CommentEnity) 
      private readonly repositoryComment: Repository<CommentEnity>,
      private readonly cacheService: CacheService
    ) {}


    async getInitialCommentData(data: {postId: number}): Promise<ReturnCommentData> {
      const cacheKey = `comments:post:${data.postId}:page:1`

      const cached: CommentEnity_Proto[] | undefined = await this.cacheService.get(cacheKey)

      console.log(cached);
      

      if (cached) {
        const response = cached.length === 0 ? [] : cached
        return {comments: response}
      }

      const initialData = await this.repositoryComment.find({
        where: {postId: data.postId},
        take: 20,
        order: {id: 'DESC'}
      })
      
      const response = initialData.length === 0 ? [] : initialData.map((comment) => convertCommentToProtoComment(comment))
      console.log(response);

      await this.cacheService.set(cacheKey, response, 30_000)

      console.log(await this.cacheService.get(cacheKey));
      
      
      return {comments: response}
    }

    async getOtherPartComment(data: {postId: number, lastId: number}): Promise<ReturnCommentData> {
      const initialData = await this.repositoryComment.find({
        where: {postId: data.postId, id: MoreThan(data.lastId)},
        take: 20
      })

      console.log('lox2');
      

      const response = initialData.length === 0 ? [] : initialData.map((comment) => convertCommentToProtoComment(comment))

      return {comments: response}
    }
    

    async getCountofComment(postIds: number[]): Promise<CommentReturnCount> {

      const result = await Promise.all(
        postIds.map(async (postId) => {
          const cacheKey = `postId:${postId}:comment:count`
          const cached: number | undefined = await this.cacheService.get(cacheKey)

          if (cached !== undefined) {
            return {postId: postId, count: cached}
          } else {
            const response = await this.repositoryComment.find({
              where: {postId: postId}
            })
            const count = response.length
            await this.cacheService.set(cacheKey, count, 0)
            return {postId: postId, count: count}
          }
        })
      )

      const resultObject: Record<number, number> = {};
      result.forEach(({postId, count}) => {
          resultObject[postId] = count
      })

      console.log(resultObject);
      

      return {comments: resultObject}
    }
}
