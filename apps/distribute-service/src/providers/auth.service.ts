import { HttpException, HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {RpcException, type  ClientGrpc } from '@nestjs/microservices';
import {convertTimeStampToDate, DistAuthPathInterface, fromProtoRoleToEntity, NewAccessToken, RefreshData} from '@repo/proto'
import { LoginScemaUser, RegisterSchemaUser, User_Login_Data} from '@repo/user-interfaces';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService implements OnModuleInit {
    private distAuthPathService: DistAuthPathInterface
    constructor(
      @Inject('DIST-AUTH-PATH')
      private readonly client: ClientGrpc
    ) {}

    onModuleInit() {
      this.distAuthPathService = this.client.getService<DistAuthPathInterface>('DistAuthPathService')
    }

    async handleregisterUser(data: RegisterSchemaUser): Promise<void> {    
      await firstValueFrom(this.distAuthPathService.registerUser(data)).catch((error) => {
        throw new HttpException('Invalid data', HttpStatus.NOT_ACCEPTABLE, {
          cause: error
        })
      })
    }


    async handleloginUser(data: LoginScemaUser): Promise<User_Login_Data> {
      try {
        const response = await firstValueFrom(this.distAuthPathService.loginUser(data))

        console.log(response);

        const {refreshToken, accessToken, ...otherData} = response

        return {
          response: {
            ...otherData,
            role: fromProtoRoleToEntity(otherData.role),
            createdAt: convertTimeStampToDate(otherData.createdAt),
            updatedAt: convertTimeStampToDate(otherData.updatedAt)
          },
          refreshToken: refreshToken,
          accessToken: accessToken
        }
      } catch (error) {
        throw new HttpException('Invalid data', HttpStatus.NOT_ACCEPTABLE, {
          cause: error
        })
      }
    }


    async handlerefreshToken(data: RefreshData): Promise<NewAccessToken> {
      return firstValueFrom(this.distAuthPathService.refreshToken(data)).catch(error => {
        throw new HttpException('Invalid data', HttpStatus.NOT_ACCEPTABLE, {
          cause: error
        })
      })
    }
}
