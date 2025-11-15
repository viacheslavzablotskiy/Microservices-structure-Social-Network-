import {Controller} from '@nestjs/common';
import { UserService } from './providers/app.service';
import {type RegisterSchemaUser} from '@repo/user-interfaces'
import {User_Entity_After_Proto_UserEmail, User_Entity_After_Proto_UserId} from '@repo/proto'
import { GrpcMethod } from '@nestjs/microservices';
import  {type ServerUnaryCall, type Metadata} from '@grpc/grpc-js'
import { Empty} from 'google-protobuf/google/protobuf/empty_pb'

@Controller('user')
export class AppController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod('AuthServiceProto', 'RegisterUser')
  async registerUser(data: RegisterSchemaUser, metadata: Metadata, call: ServerUnaryCall<any, any>): Promise<Empty> {
    console.log('we already about create new user with this data', data);
    
    await this.userService.handleCreationdNewUser(data)

    console.log('we create new user and return you nothing');
    
    return new Empty()
  }


  @GrpcMethod('AuthServiceProto', 'GetUserByEmail')
  async getUserByEmail(
    data: {email: string}, metadata: Metadata, call: ServerUnaryCall<any, any>
  ) : Promise<User_Entity_After_Proto_UserEmail> {
    console.log('we already in user-service');
    

    const response = await this.userService.handleLoginExistingUser(data.email)

    console.log('we get answer from the user-service-provoder', response);
    
    return response
  }

  @GrpcMethod('AuthServiceProto', 'GetUserById')
  async getUserById(
    data: {id: number}, metadata: Metadata, call: ServerUnaryCall<any, any> 
  ) : Promise<User_Entity_After_Proto_UserId> {
    const response = await this.userService.handleGetUserById(data.id)
    return response
  }
}
