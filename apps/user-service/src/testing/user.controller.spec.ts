import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { UserSecurityEntity } from 'src/entities/user.security.entity';
import { UserStatsEntity } from 'src/entities/user.stats.entity';
import { UserSettingsEntity } from 'src/entities/user.settings.entity';
import { UserProfileEntity } from 'src/entities/user.profile.entity';
import { UserRealationEntity } from 'src/entities/user.relations.entity';
import { UserService } from 'src/providers/app.service';
import { DataSource } from 'typeorm';
import { User_Entity_After_Proto_UserEmail, User_Entity_After_Proto_UserId} from '@repo/proto';


describe('UserSerice (integration test with db)', () => {
    let userSerive: UserService;
    let dataSourse: DataSource;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
        imports: [
            ConfigModule.forRoot({isGlobal: true}),
            TypeOrmModule.forFeature([UserEntity, UserProfileEntity, UserSecurityEntity,
            UserSettingsEntity, UserStatsEntity, UserRealationEntity]),
            TypeOrmModule.forRootAsync({
                inject: [ConfigService],
                useFactory: async (config: ConfigService) => ({
                    type: 'mysql',
                    host: config.get<string>('DB_HOST'),
                    port: config.get<number>('DB_PORT'),
                    username: config.get<string>('DB_USER'),
                    password: config.get<string>('DB_PASSWORD'),
                    database: config.get<string>('DB_TEST_NAME'),
                    entities: [UserEntity, UserProfileEntity, UserRealationEntity, UserSecurityEntity, UserSettingsEntity, UserStatsEntity],
                    dropSchema: true,
                    synchronize: true
                })
            })
        ],
        providers: [UserService]
    }).compile()

    userSerive = module.get<UserService>(UserService)
    dataSourse = module.get<DataSource>(DataSource)
    })

    afterAll(async () => {
        await dataSourse.destroy()
    })

    it('test creation new user in db', async () => {
        const dto = {login: 'zlava', email: 'zlava.mag@gmail.com', password: '11111111', passwordConfirm: '11111111'}

        await userSerive.handleCreationdNewUser(dto)

        const userRepo = dataSourse.getRepository(UserEntity);
        const savedUser = await userRepo.findOne({
            where: {login: dto.login}
        })
        const securityRepo = dataSourse.getRepository(UserSecurityEntity)
        const securityData = await securityRepo.findOne({
            where: {email: dto.email}
        })

        expect(savedUser).toBeDefined();
        expect(savedUser?.login).toEqual(dto.login);

        expect(securityData).toBeDefined();
        expect(securityData?.email).toEqual(dto.email)
        })

    
    it('check if we can find user by email', async () => {
        const dto = {email: 'zlava.mag@gmail.com'}

        const response: User_Entity_After_Proto_UserEmail = await userSerive.handleLoginExistingUser(dto.email)
        const {createdAt, updatedAt, ...otherData} = response
        
        expect(response).toBeDefined()

        expect(response.createdAt).toMatchObject({
            seconds: expect.any(Number),
            nanos: expect.any(Number)
        })
        expect(response.updatedAt).toMatchObject({
            seconds: expect.any(Number),
            nanos: expect.any(Number)
        })

        expect(otherData).toMatchObject({
            id: expect.any(Number),
            email: expect.any(String),
            login: expect.any(String),
            isActivate: expect.any(Boolean),
            isVerified: expect.any(Boolean),
            coverUrl: expect.any(String),
            avatarUrl: expect.any(String),
            role: expect.any(Number),
            passwordHash: expect.any(String)
        })
    })

    it('check if we can find user by id', async () => {
        const dto = {id: 1}

        const response: User_Entity_After_Proto_UserId = await userSerive.handleGetUserById(dto.id)

        const {createdAt, updatedAt, ...otherData} = response

        expect(response).toBeDefined()

        expect(response.id).toEqual(dto.id)

        expect(response.createdAt).toMatchObject({
                seconds: expect.any(Number),
                nanos: expect.any(Number)
        })
        expect(response.updatedAt).toMatchObject({
                seconds: expect.any(Number),
                nanos: expect.any(Number)
        })

        expect(otherData).toMatchObject<Partial<User_Entity_After_Proto_UserId>>({
            id: expect.any(Number),
            login: expect.any(String),
            isActivate: expect.any(Boolean),
            isVerified: expect.any(Boolean),
            coverUrl: expect.any(String),
            avatarUrl: expect.any(String),
            role: expect.any(Number),
        })
    })
})


