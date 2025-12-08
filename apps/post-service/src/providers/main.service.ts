import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {Post_Enitity_Proto} from '@repo/user-interfaces'
import { PostEntity } from '../entities/post.entity';
import { MoreThan, Repository } from 'typeorm';
import {convertFromPostToProto} from '../utils/convertToProto'
import { ReturnPostsDto } from '@repo/proto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly repositoryPost: Repository<PostEntity>
  ) {}
 
  async getInitialState(): Promise<ReturnPostsDto> {
    const inital_part_posts = await this.repositoryPost.find({
      order: {id: 'ASC'},
      take: 20
    })

    const posts = inital_part_posts.map((port) => convertFromPostToProto(port))
    
    return {posts: posts}
  }

  async getSomePartOfPost(lastId: number): Promise<ReturnPostsDto> {
    const next_part_of_post = await this.repositoryPost.find({
      where: {id: MoreThan(lastId)},
      order: {id: 'ASC'},
      take: 20
    })
  
    const response = next_part_of_post.map((post) => convertFromPostToProto(post))

    return {posts: response}
  } 

}
