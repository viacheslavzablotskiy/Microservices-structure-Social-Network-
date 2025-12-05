import { Test, TestingModule } from '@nestjs/testing';
import { LikeService } from 'src/like.service';
import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikeEntity } from 'src/entities/like.entity';
import { Like_Proto_Entity } from '@repo/user-interfaces';


describe('test likeService', () => {
    let likeService: LikeService;
    let dataSource: DataSource


    beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        TypeOrmModule.forFeature([LikeEntity]),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                type: 'mysql',
                host: config.get<string>('DB_HOST'),
                port: config.get<number>('DB_PORT'),
                username: config.get<string>('DB_USER'),
                password: config.get<string>('DB_PASSWORD'),
                database: config.get<string>('DB_TEST_NAME'),
                entities: [LikeEntity],
                dropSchema: true,
                synchronize: true
            })
        })
    ],
    providers: [LikeService]
}).compile()

    likeService = module.get<LikeService>(LikeService)
    dataSource = module.get<DataSource>(DataSource)

    })

    afterAll(async () => {
        await dataSource.destroy()
    })


    it('test creation new like', async () => {
        const dto = {userId: 1, postId: 1}

        const response = await likeService.createNewLike(dto)

        const dataSourceLike = dataSource.getRepository(LikeEntity)
        const existing = await dataSourceLike.findOne({
            where: {postId: dto.postId}
        })


        expect(response).toBeDefined()
        expect(existing).toBeDefined()

        expect(response.createdAt).toMatchObject({
            seconds: expect.any(Number),
            nanos: expect.any(Number)
        })

        expect(response).toMatchObject({
            id: expect.any(Number), postId: expect.any(Number), userId: expect.any(Number), createdAt: expect.any(Object)
        })

        expect(existing?.postId).toEqual(dto.postId)

        expect(existing).toMatchObject<Like_Proto_Entity>({
            id: expect.any(Number), postId: expect.any(Number), userId: expect.any(Number), createdAt: expect.any(Object)
        })
    })

    it('delete like', async () => {
        const dto = {id: 1};

        await likeService.deleteLike(dto)

        const dataSoruceDleetion = dataSource.getRepository(LikeEntity)
        const response = await dataSoruceDleetion.findOne({
            where: {id: dto.id}
        })

        expect(response).toBeNull()
    })
})