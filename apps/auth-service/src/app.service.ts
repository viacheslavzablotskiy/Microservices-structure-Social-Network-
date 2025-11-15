import { BadRequestException, Inject, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import {type LoginScemaUser, type RegisterSchemaUser} from '@repo/user-interfaces'
import {firstValueFrom} from 'rxjs'
import * as bcrypt from 'bcrypt'
import { AuthCreationToken } from '@repo/api';
import { type ClientGrpc } from '@nestjs/microservices';
import {fromProtoRoleToEntity, convertTimeStampToDate, AuthServiceProto, User_Entity_After_Proto_UserEmail} from '@repo/proto'

@Injectable()
export class AuthService implements OnModuleInit{
  private authServiceProto: AuthServiceProto
  
  constructor(
    private readonly creationToken: AuthCreationToken,
    @Inject('AUTH-USER-PACKAGE') private readonly client: ClientGrpc
  ) {}

   onModuleInit() {
    this.authServiceProto = this.client.getService<AuthServiceProto>('AuthServiceProto')
    console.log(this.authServiceProto);
    
   }

  ///ADD RABBITMQ TO MAKE ASYNC REQUEST THAT WE DONT NEED MAKE IN REAL-TIMA AND DONT LOAD OUR DB AND SERVER


  async createNewUserViaRegistration(dto: Omit<RegisterSchemaUser, 'passwordConfirm'>): Promise<void> {
    console.log('we already in method of the resiter new user');

    await  firstValueFrom(this.authServiceProto.registerUser({
      login: dto.login,
      email: dto.email,
      password: dto.password
    }))

    console.log('we return nothing to you');
    
  }

  async loginUser(dto: LoginScemaUser): Promise<User_Entity_After_Proto_UserEmail>{

    console.log('we before gRPC');
    
    const responesFromServer = await firstValueFrom(this.authServiceProto.getUserByEmail({email: dto.email}))   
    
    console.log(responesFromServer);
    

    const isMatch = await bcrypt.compare(dto.password, responesFromServer.passwordHash)

    console.log(isMatch);
    
    if (!isMatch) throw new BadRequestException('Invalid password')
      
    return responesFromServer
    
  }

  async getNewAccessToken(dto: User_Entity_After_Proto_UserEmail): Promise<{accessToken: string}> {
    const response = this.creationToken.creationAccessToken({id: dto.id, login: dto.login})
    return response
  }

  async getNewRefreshToken(dto: User_Entity_After_Proto_UserEmail): Promise<{refreshToken: string}> {
    const resonse = this.creationToken.createtionRefreshToken({id: dto.id, login: dto.login})
    return resonse
  }


  async recreationAccessToken(refreshToken: string) {
    try {
      const payload = await this.creationToken.getDataFromRefreshToken(refreshToken) 

      const response = await firstValueFrom(this.authServiceProto.getUserById({id: payload.id}))

      const correct_data = {...response, 
      role: fromProtoRoleToEntity(response.role),
      createdAt: convertTimeStampToDate(response.createdAt),
      updatedAt: convertTimeStampToDate(response.updatedAt),
    }
      
      return await this.creationToken.creationAccessToken(correct_data)

    } catch (error) {
      throw new UnauthorizedException(error)
    }
    
  }
}
