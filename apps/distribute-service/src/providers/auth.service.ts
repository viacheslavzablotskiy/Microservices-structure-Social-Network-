import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {type  ClientGrpc } from '@nestjs/microservices';
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
      console.log('we already go to first grpc');
      
      await firstValueFrom(this.distAuthPathService.registerUser(data))
    }


    async handleloginUser(data: LoginScemaUser): Promise<User_Login_Data> {
      const response = await firstValueFrom(this.distAuthPathService.loginUser(data))
      console.log(response);
      

      const {refreshToken, accessToken, ...otherData} = response

      console.log(refreshToken);
      console.log(accessToken);
      console.log(otherData);
      
      
      

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
    }

    async handlerefreshToken(data: RefreshData): Promise<NewAccessToken> {
      const response = await firstValueFrom(this.distAuthPathService.refreshToken(data))

      return response
    }
}
