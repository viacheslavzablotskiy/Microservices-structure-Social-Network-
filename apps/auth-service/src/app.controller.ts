import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import {ZodValidationPipe} from '@repo/api'
import {RegisterSchema, type RegisterSchemaUser, LoginScema, type LoginScemaUser, User_Login_Data} from '@repo/user-interfaces'
import {NewAccessToken, type RefreshData, User_after_auth_service_login} from '@repo/proto'
import { AuthService } from './app.service';
import {type Request, type Response } from 'express';
import { GrpcMethod } from '@nestjs/microservices';
import { Empty} from 'google-protobuf/google/protobuf/empty_pb'

@Controller('auth')
export class AppController {
  constructor(
    private readonly authService: AuthService
  ) {}

  @GrpcMethod('DistAuthPathService', 'RegisterUser')
  async registerUser(data: {login: string, email: string, password: string}): Promise<Empty> {

    console.log('we already in auth-service');
    

    await this.authService.createNewUserViaRegistration(data)
    return new Empty()
  }


  @GrpcMethod('DistAuthPathService', 'LoginUser')
  async loginUser(data: LoginScemaUser): Promise<User_after_auth_service_login> {
    
    const response = await this.authService.loginUser(data)
    console.log(response);
    

    const access_token = await this.authService.getNewAccessToken(response)

    const refresh_token = await this.authService.getNewRefreshToken(response)

    const l = {...response, access_token, refresh_token}
    console.log(l);
    

    return {
      ...response,
      accessToken: access_token,
      refreshToken: refresh_token
    }
  }


  @GrpcMethod('DistAuthPathService', 'RefreshToken')
  async refreshToken(data: RefreshData): Promise<NewAccessToken> {
    if (!data) throw new UnauthorizedException('You dont authorizited(refresh_token)')
    
    const response = await this.authService.recreationAccessToken(data.refreshToken)

    return response
  }

}
