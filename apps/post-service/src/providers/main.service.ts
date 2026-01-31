import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {Post_Enitity_Proto} from '@repo/user-interfaces'
import { PostEntity } from '../entities/post.entity';
import { LessThan, MoreThan, Repository } from 'typeorm';
import {convertFromPostToProto} from '../utils/convertToProto'
import { DistUserService, ReturnPostsDto } from '@repo/proto';
import { CacheService } from '@repo/chache-package'; 
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PostService  implements OnModuleInit {
  private distUserSerivce: DistUserService

  constructor(
    @InjectRepository(PostEntity)
    private readonly repositoryPost: Repository<PostEntity>,
    private readonly cacheService: CacheService,
    @Inject('DIST-USER-PATH') private readonly client: ClientGrpc
  ) {}

  onModuleInit() {
    this.distUserSerivce = this.client.getService<DistUserService>('DistUserService')
  }
 
  async getInitialState(): Promise<ReturnPostsDto> {
    const cacheKey = `post:page:1`

    const inital_part_posts = await this.repositoryPost.find({
      order: {id: 'DESC'},
      take: 20
    })

    const userIds = [...new Set(inital_part_posts.map(post => post.userId))]
    const userData = await firstValueFrom(this.distUserSerivce.getBatchData(userIds))

    const posts = inital_part_posts.map((post) => convertFromPostToProto(post))

    await this.cacheService.set(cacheKey, posts, 0)
    
    return {posts: posts.map(post => {
      return {
        ...post,
        userData: userData[post.userId]
      }
    })}
  }

  async getSomePartOfPost(lastId: number): Promise<ReturnPostsDto> {
    const next_part_of_post = await this.repositoryPost.find({
      where: {id: LessThan(lastId)},
      order: {id: 'DESC'},
      take: 20
    })

    const userIds = [...new Set(next_part_of_post.map(post => post.userId))]
    const userData = await firstValueFrom(this.distUserSerivce.getBatchData(userIds))
  
    const response = next_part_of_post.map((post) => convertFromPostToProto(post))

    return {posts: response.map(post => {
      return {...post,
      userData: userData[post.userId]
    }})}
  } 

}
