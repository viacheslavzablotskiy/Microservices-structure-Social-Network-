import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { UserEntity, UserRole } from 'src/entities/user.entity';
import { DataSource, In, Repository } from 'typeorm';
import {type RegisterSchemaUser, type LoginScemaUser, BatchUser} from '@repo/user-interfaces'
import { UserSecurityEntity } from 'src/entities/user.security.entity';
import { User_Entity_After_Proto_UserId, entityToProto, User_Entity_After_Proto_UserEmail, convertDateToTimeStamp, convertTimeStampToDate} from '@repo/proto';
import { CacheService } from '@repo/chache-package';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UserService {

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(UserSecurityEntity)
    private readonly repositorySecurity: Repository<UserSecurityEntity>,
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
    private readonly cacheService: CacheService
  ) {}

  async handleCreationdNewUser(dto: RegisterSchemaUser): Promise<void> {

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


  async handleLoadOfTheBunchUser(userIds: number[]): Promise<BatchUser> {
    const userId =  await this.repository.find({
      where: {id: In(userIds)}, select: ['id', 'avatarUrl', 'login']
    })
    return userId.reduce((acc, user) => {
        acc[user.id] = {id: user.id, avatarKey: user.avatarUrl, login: user.login}
        return acc
    }, {})
  }

  async handleLoginExistingUser(email: string): Promise<User_Entity_After_Proto_UserEmail> {
    const cacheKey = `email:${email}`

    const cached: UserEntity & {email: string, passwordHash: string} | undefined  = await this.cacheService.get(cacheKey)

    if (cached) {
      console.log(cached);
      
      return {
      ...cached, role: entityToProto(cached.role),
      createdAt: convertDateToTimeStamp(new Date(cached.createdAt)),
      updatedAt: convertDateToTimeStamp(new Date(cached.updatedAt))
      }
    }

    const currentSecurity = await this.repositorySecurity.findOne({
      where: {email: email},
      relations: {user: true}
    })

    if (currentSecurity === null) throw new RpcException('There is not User with this email')

    const data = {
      ...currentSecurity.user,
      email: email,
      passwordHash: currentSecurity.passwordHash
    }

    this.cacheService.set(`email:${email}`, {
      ...data, createdAt: data.createdAt.toISOString(),
      updatedAt: data.createdAt.toISOString()
    }, 0)

    return {
      ...data, role: entityToProto(data.role),
      createdAt: convertDateToTimeStamp(data.createdAt),
      updatedAt: convertDateToTimeStamp(data.updatedAt)
    }
  }

  async handleGetUserById(userId: number) : Promise<User_Entity_After_Proto_UserId> {
    const cacheKey = `userId:${userId}`
    const cached: UserEntity | undefined = await this.cacheService.get(cacheKey)

    if (cached) {
      return {
      ...cached,
      role: entityToProto(cached.role),
      createdAt: convertDateToTimeStamp(new Date(cached.createdAt)),
      updatedAt: convertDateToTimeStamp(new Date(cached.updatedAt))
    }
    }

    const currenAuthUser = await this.repository.findOne({
      where: {id: userId}
    })

    if (!currenAuthUser) throw new RpcException('There is not User with this id')

    this.cacheService.set(`userId:${userId}`, {
      ...currenAuthUser, createdAt: currenAuthUser.createdAt.toISOString(),
      updatedAt: currenAuthUser.updatedAt.toISOString()
    })

    return {
      ...currenAuthUser,
      role: entityToProto(currenAuthUser.role),
      createdAt: convertDateToTimeStamp(currenAuthUser.createdAt),
      updatedAt: convertDateToTimeStamp(currenAuthUser.updatedAt)
    }
  }

}
