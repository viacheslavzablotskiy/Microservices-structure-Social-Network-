import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {Post_Enitity_Proto} from '@repo/user-interfaces'
import { PostEntity } from '../entities/post.entity';
import { LessThan, MoreThan, Repository } from 'typeorm';
import {convertFromPostToProto} from '../utils/convertToProto'
import { ReturnPostsDto } from '@repo/proto';
import { CacheService } from '@repo/chache-package'; 

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly repositoryPost: Repository<PostEntity>,
    private readonly cacheService: CacheService
  ) {}
 
  async getInitialState(): Promise<ReturnPostsDto> {
    const cacheKey = `post:page:1`

    const inital_part_posts = await this.repositoryPost.find({
      order: {id: 'DESC'},
      take: 20
    })

    const posts = inital_part_posts.map((port) => convertFromPostToProto(port))

    await this.cacheService.set(cacheKey, posts, 0)
    
    return {posts: posts}
  }

  async getSomePartOfPost(lastId: number): Promise<ReturnPostsDto> {
    const next_part_of_post = await this.repositoryPost.find({
      where: {id: LessThan(lastId)},
      order: {id: 'DESC'},
      take: 20
    })
  
    const response = next_part_of_post.map((post) => convertFromPostToProto(post))

    return {posts: response}
  } 

}
