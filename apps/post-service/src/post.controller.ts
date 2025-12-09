import { Controller, Get } from '@nestjs/common';
import { PostService } from './providers/main.service';
import { CrudService } from './providers/crud.service';
import { GrpcMethod } from '@nestjs/microservices';
import { Post_Enitity_Proto, type CretionNewPost } from '@repo/user-interfaces';
import { ReturnPostsDto } from '@repo/proto';

@Controller()
export class AppController {
  constructor(
    private readonly postService: PostService,
    private readonly crudService: CrudService
  ) {}



  @GrpcMethod('DistPostService', 'GetInitialPosts')
  async getIntialPosts(data: {}): Promise<ReturnPostsDto> {
    return await this.postService.getInitialState()
  }

  @GrpcMethod('DistPostService', 'GetSomePartPosts')
  async getSomePartPosts(data: {lastId: number}): Promise<ReturnPostsDto> {
    const response = await this.postService.getSomePartOfPost(data.lastId)
    console.log(response);
    
    return response
  }

  @GrpcMethod('DistPostService', 'CreateNewPost')
  async createNewPost(data: CretionNewPost): Promise<{}> {
    return await this.crudService.handleNewPost(data)
  }

  @GrpcMethod('DistPostService', 'UpdatePost')
  async updatePost(data: Partial<Omit<Post_Enitity_Proto, 'createdAt' | 'updatedAt' | 'id' | 'userId'>> 
    & Pick<Post_Enitity_Proto, 'id' | 'userId'>
  ) : Promise<Post_Enitity_Proto> {
    console.log(data);
    
    return await this.crudService.updatePost(data)
  }

  @GrpcMethod('DistPostService', 'DeletePost')
  async deletePost(data: {id: number, userId: number}): Promise<{}> {
    console.log(data);
    
    return await this.crudService.deletePost(data)
  }
  
}
