import {Controller, UseFilters} from '@nestjs/common';
import { UserService } from './providers/app.service';
import {type RegisterSchemaUser} from '@repo/user-interfaces'
import {BatchDataPorto, User_Entity_After_Proto_UserEmail, User_Entity_After_Proto_UserId} from '@repo/proto'
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import  {type ServerUnaryCall, type Metadata} from '@grpc/grpc-js'
import { Empty} from 'google-protobuf/google/protobuf/empty_pb'
import { RpcExceptionFilter } from '@repo/api'

@Controller('user')
export class AppController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod('AuthServiceProto', 'RegisterUser')
  @UseFilters(new RpcExceptionFilter())
  async registerUser(data: RegisterSchemaUser, metadata: Metadata, call: ServerUnaryCall<any, any>): Promise<Empty> {
    try {
      console.log('we already about create new user with this data', data);
    
      await this.userService.handleCreationdNewUser(data)

      console.log('we create new user and return you nothing');
      
      return new Empty()
    } catch (error) {
      if (error instanceof RpcException) {
        throw new RpcException(error.getError())
      } else throw new Error(error)
    }
  }


  @GrpcMethod('AuthServiceProto', 'GetUserByEmail')
  @UseFilters(new RpcExceptionFilter())
  async getUserByEmail(
    data: {email: string}, metadata: Metadata, call: ServerUnaryCall<any, any>
  ) : Promise<User_Entity_After_Proto_UserEmail> {
    try {
      const response = await this.userService.handleLoginExistingUser(data.email)
      return response
    } catch (error) {
      if (error instanceof RpcException) {
        throw new RpcException(error.getError())
      } else throw new Error(error)
    }
  }

  @GrpcMethod('AuthServiceProto', 'GetUserById')
  @UseFilters(new RpcExceptionFilter())
  async getUserById(
    data: {id: number}, metadata: Metadata, call: ServerUnaryCall<any, any> 
  ) : Promise<User_Entity_After_Proto_UserId> {
    try {
      return await this.userService.handleGetUserById(data.id)
    } catch (error) {
      if (error instanceof RpcException) {
        throw new RpcException(error.getError())
      } else throw new Error(error)
    }
  }

  @GrpcMethod('DistUserService', 'GetBatchData')
  @UseFilters(new RpcExceptionFilter())
  async getBatchData(data: number[]): Promise<BatchDataPorto> {
    return this.userService.handleLoadOfTheBunchUser(data)
  }

}
