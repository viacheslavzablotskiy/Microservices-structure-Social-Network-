import { Test, TestingModule } from '@nestjs/testing';
import { CrudService } from 'src/providers/crud.service';
import { PostService } from 'src/providers/main.service';
import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from 'src/entities/post.entity';



describe('testing Post Service', () => {
    let postService: PostService;
    let postCrudService: CrudService;
    let dataSource: DataSource

     beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
        imports: [
            ConfigModule.forRoot({isGlobal: true}),
            TypeOrmModule.forFeature([PostEntity]),
            TypeOrmModule.forRootAsync({
                inject: [ConfigService],
                useFactory: async (config: ConfigService) => ({
                    type: 'mysql',
                    host: config.get<string>('DB_HOST'),
                    port: config.get<number>('DB_PORT'),
                    username: config.get<string>('DB_USER'),
                    password: config.get<string>('DB_PASSWORD'),
                    database: config.get<string>('DB_TEST_NAME'),
                    entities: [PostEntity],
                    dropSchema: true,
                    synchronize: true
                })
            })
        ],
        providers: [PostService, CrudService]
    }).compile()

    postService = module.get<PostService>(PostService)
    postCrudService = module.get<CrudService>(CrudService)
    dataSource = module.get<DataSource>(DataSource)
    })

    afterAll(async () => {
        if (dataSource && dataSource.isInitialized) {
             await dataSource.destroy()
        }
    })


    it('test creaction Post', async () => {
        const dto = {userId: 1, title: 'hello', content: 'cont', imageUrl: 'http/'}

        await postCrudService.handleNewPost(dto)

        const dataSourcePost = dataSource.getRepository(PostEntity)
        const response = await dataSourcePost.findOne({
            where: {userId: dto.userId}
        })

        expect(response).toBeDefined()
        expect(response?.title).toEqual(dto.title)
    })

    it('test updated post', async () => {
        const dto = {id: 1, title: 'name', content: 'let'}

        const updatingData = await postCrudService.updatePost(dto)

        const dataSourseUpdating = dataSource.getRepository(PostEntity)
        const response = await dataSourseUpdating.findOne({
            where: {title: dto.title}
        })


        expect(response).toBeDefined()
        
        expect(updatingData?.createdAt).toMatchObject({
            seconds: expect.any(Number),
            nanos: expect.any(Number)
        })

        expect(response?.content).toEqual(dto.content)
    })

    it('test getting initial Post Data', async () => {
        const repsonse = await postService.getInitialState()

        expect(repsonse).toBeDefined()

        expect(repsonse).toMatchObject([{
            id: expect.any(Number), userId: expect.any(Number),title: expect.any(String), content: expect.any(String),
            imageUrl: expect.any(String), createdAt: expect.any(Object),  updatedAt: expect.any(Object)
        }])
    })

    it('test getting other Post Data', async () => {
        const dto = {lastId: 0}

        const response = await postService.getSomePartOfPost(dto.lastId)

        expect(response).toBeDefined()

        expect(response).toMatchObject([{
            id: expect.any(Number), userId: expect.any(Number),title: expect.any(String), content: expect.any(String),
            imageUrl: expect.any(String), createdAt: expect.any(Object),  updatedAt: expect.any(Object)
        }])

        expect(response).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: expect.any(Number), userId: expect.any(Number),title: expect.any(String), content: expect.any(String),
                imageUrl: expect.any(String), createdAt: expect.any(Object),  updatedAt: expect.any(Object)
            })
        ]))
    })

    it('test delete Post', async () => {
        const dto = {id: 1}

        await postCrudService.deletePost(dto)

        const dataSourcePostDelete =  dataSource.getRepository(PostEntity)
        const response = await dataSourcePostDelete.findOne({
            where: {id: dto.id}
        })

        expect(response).toBeNull()
    })
})
