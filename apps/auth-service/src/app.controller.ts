import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseFilters } from '@nestjs/common';
import {RpcExceptionFilter, ZodValidationPipe} from '@repo/api'
import {RegisterSchema, type RegisterSchemaUser, LoginScema, type LoginScemaUser, User_Login_Data} from '@repo/user-interfaces'
import {NewAccessToken, type RefreshData, User_after_auth_service_login} from '@repo/proto'
import { AuthService } from './app.service';
import {type Request, type Response } from 'express';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { Empty} from 'google-protobuf/google/protobuf/empty_pb'

@Controller('auth')
export class AppController {
  constructor(
    private readonly authService: AuthService
  ) {}

  @GrpcMethod('DistAuthPathService', 'RegisterUser')
  async registerUser(data: {login: string, email: string, password: string}): Promise<Empty> {
    try {
      await this.authService.createNewUserViaRegistration(data)
      return new Empty()
    } catch (error) {
      if (error instanceof RpcException) {
       throw new RpcException('Invalid Register Data')
      } else throw new Error(error)
    }
  }


  @GrpcMethod('DistAuthPathService', 'LoginUser')
  @UseFilters(new RpcExceptionFilter())
  async loginUser(data: LoginScemaUser): Promise<Omit<User_after_auth_service_login, 'email' | 'passwordHash'>> {
    try {
      const response = await this.authService.loginUser(data)
      const [access_token, refresh_token] = await Promise.all([
        this.authService.getNewAccessToken(response),
        this.authService.getNewRefreshToken(response)
      ])
      const {email, passwordHash, ...otherData} = response
      console.log({...otherData, access_token, refresh_token});
    
    return  {
      ...otherData,
      accessToken: access_token,
      refreshToken: refresh_token
    }
    } catch (error) {
      if (error instanceof RpcException) {
        throw new RpcException(error.getError())
      } else throw new Error(error)
    }
    
  }


  @GrpcMethod('DistAuthPathService', 'RefreshToken')
  async refreshToken(data: RefreshData): Promise<NewAccessToken> {
    try {
        return await this.authService.recreationAccessToken(data.refreshToken)
    } catch (error) {
      if (error instanceof RpcException) {
        throw new RpcException(error.getError())
      } else throw new Error(error)
    }
  }

}
