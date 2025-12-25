import { Controller, Get, UseFilters } from '@nestjs/common';
import { PostService } from './providers/main.service';
import { CrudService } from './providers/crud.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { Post_Enitity_Proto, type CretionNewPost } from '@repo/user-interfaces';
import { ReturnPostsDto } from '@repo/proto';
import {RpcExceptionFilter} from '@repo/api'

@Controller()
export class AppController {
  constructor(
    private readonly postService: PostService,
    private readonly crudService: CrudService
  ) {}



  @GrpcMethod('DistPostService', 'GetInitialPosts')
  @UseFilters(new RpcExceptionFilter())
  async getIntialPosts(data: {}): Promise<ReturnPostsDto> {
    try {
      return await this.postService.getInitialState()
    } catch (error) {
      if (error instanceof RpcException) {
        throw new RpcException(error.getError())
      } else throw new Error(error)
    }
  }

  @GrpcMethod('DistPostService', 'GetSomePartPosts')
  @UseFilters(new RpcExceptionFilter())
  async getSomePartPosts(data: {lastId: number}): Promise<ReturnPostsDto> {
    try {
      return await this.postService.getSomePartOfPost(data.lastId)
    } catch (error) {
      if (error instanceof RpcException) {
        throw new RpcException(error.getError())
      } else throw new Error(error)
    }
  }

  @GrpcMethod('DistPostService', 'CreateNewPost')
  @UseFilters(new RpcExceptionFilter())
  async createNewPost(data: CretionNewPost): Promise<Post_Enitity_Proto> {
    try {
      return await this.crudService.handleNewPost(data)
    } catch (error) {
      if (error instanceof RpcException) {
        throw new RpcException(error.getError())
      } else throw new Error(error)
    }
  }

  @GrpcMethod('DistPostService', 'UpdatePost')
  @UseFilters(new RpcExceptionFilter())
  async updatePost(data: Partial<Omit<Post_Enitity_Proto, 'createdAt' | 'updatedAt' | 'id' | 'userId'>> 
    & Pick<Post_Enitity_Proto, 'id' | 'userId'>
  ) : Promise<Post_Enitity_Proto> {
    try {    
      return await this.crudService.updatePost(data)
    } catch (error) { 
      if (error instanceof RpcException) {
        throw new RpcException(error.getError()) 
      } else throw new Error(error)
    }
  }

  @GrpcMethod('DistPostService', 'DeletePost')
  @UseFilters(new RpcExceptionFilter())
  async deletePost(data: {id: number, userId: number}): Promise<{}> {
    try {
      return await this.crudService.deletePost(data)
    } catch (error) {
      if (error instanceof RpcException) {
        throw new RpcException(error.getError())
      } else throw new RpcException(error)
    }
  }
  
}
