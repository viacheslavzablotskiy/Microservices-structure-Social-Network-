import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { UserEntity, UserRole } from 'src/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import {type RegisterSchemaUser, type LoginScemaUser} from '@repo/user-interfaces'
import { UserSecurityEntity } from 'src/entities/user.security.entity';
import { User_Entity_After_Proto_UserId, entityToProto, User_Entity_After_Proto_UserEmail, convertDateToTimeStamp, convertTimeStampToDate} from '@repo/proto';

@Injectable()
export class UserService {

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(UserSecurityEntity)
    private readonly repositorySecurity: Repository<UserSecurityEntity>,
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async handleCreationdNewUser(dto: RegisterSchemaUser): Promise<void> {

    console.log('we almost create new user, we at the stage of add to database');

    console.log(dto);
    
    

    await this.dataSource.transaction(async (manager) => {
      const security = manager.create(UserSecurityEntity, {
        email: dto.email,
        passwordHash: dto.password,
        twoFactorEnabled: false
      })

      await manager.save(security)

      const newUserEntity = manager.create(UserEntity, {
      isActivate: true,
      isVerified: false,
      role: UserRole.USER,
      avatarUrl: '',
      coverUrl: '',
      login: dto.login,
      profile: {},
      stats: {},
      settings: {},
      security
    })
      return await manager.save(newUserEntity)
    })
  }


  async handleLoginExistingUser(email: string): Promise<User_Entity_After_Proto_UserEmail> {
    const currentSecurity = await this.repositorySecurity.findOne({
      where: {email: email},
      relations: {user: true}
    })

    console.log('we getting get you if thi ssuser is existing');
    

    if (!currentSecurity) throw new UnauthorizedException('There is not User with this email')

    const data = {
      ...currentSecurity.user,
      email: email,
      passwordHash: currentSecurity.passwordHash
    }
    return {
      ...data, role: entityToProto(data.role),
      createdAt: convertDateToTimeStamp(data
        .createdAt
      ),
      updatedAt: convertDateToTimeStamp(data.updatedAt)
    }
  }

  async handleGetUserById(userId: number) : Promise<User_Entity_After_Proto_UserId> {
    const currenAuthUser = await this.repository.findOne({
      where: {id: userId}
    })

    if (!currenAuthUser) throw new UnauthorizedException('There is not User with this id')

    return {
      ...currenAuthUser,
      role: entityToProto(currenAuthUser.role),
      createdAt: convertDateToTimeStamp(currenAuthUser.createdAt),
      updatedAt: convertDateToTimeStamp(currenAuthUser.updatedAt)
    }
  }

}
