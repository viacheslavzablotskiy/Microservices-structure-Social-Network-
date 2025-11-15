import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {Post_Enitity_Proto} from '@repo/user-interfaces'
import { PostEntity } from '../entities/post.entity';
import { MoreThan, Repository } from 'typeorm';
import {convertFromPostToProto} from '../utils/convertToProto'

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly repositoryPost: Repository<PostEntity>
  ) {}
 
  async getInitialState(): Promise<Post_Enitity_Proto[]> {
    const inital_part_posts = await this.repositoryPost.find({
      order: {id: 'ASC'},
      take: 20
    })
    
    return inital_part_posts.map((port) => convertFromPostToProto(port))
  }

  async getSomePartOfPost(lastId: number): Promise<Post_Enitity_Proto[]> {
    const next_part_of_post = await this.repositoryPost.find({
      where: {id: MoreThan(lastId)},
      order: {id: 'ASC'},
      take: 20
    })

    return next_part_of_post.map((post) => convertFromPostToProto(post))
  } 

}
