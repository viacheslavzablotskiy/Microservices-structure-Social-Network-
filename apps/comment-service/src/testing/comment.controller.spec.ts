import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigSource } from '@nestjs/microservices/external/kafka.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEnity_Proto } from '@repo/user-interfaces';
import { CommentEnity } from 'src/entitis/comment.entity';
import { CommentService } from 'src/providers/comment.service';
import { CrudCommentService } from 'src/providers/crud.comment.service';
import { DataSource } from 'typeorm';


describe('Comment service CRUD AND OTHER', () => {
    let commentService: CommentService;
    let crudCommentService: CrudCommentService;
    let dataSoruce: DataSource;
    
    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({isGlobal: true}),
                TypeOrmModule.forFeature([CommentEnity]),
                TypeOrmModule.forRootAsync({
                    inject: [ConfigService],
                    useFactory: async (config: ConfigService) => ({
                        type: 'mysql',
                        host: config.get<string>('DB_HOST'),
                        port: config.get<number>('DB_PORT'),
                        username: config.get<string>('DB_USER'),
                        password: config.get<string>('DB_PASSWORD'),
                        database: config.get<string>('DB_TEST_NAME'),
                        entities: [CommentEnity],
                        dropSchema: true,
                        synchronize: true
                    })
                })
            ],
            controllers: [],
            providers: [CommentService, CrudCommentService]
        }).compile()

        commentService = module.get<CommentService>(CommentService),
        crudCommentService = module.get<CrudCommentService>(CrudCommentService)
        dataSoruce = module.get<DataSource>(DataSource)
    })


    afterAll(async () => {
        await dataSoruce.destroy()
    })

    it('test creation new Comment', async () => {
        const dto = {postId: 1, userId: 1, content: 'this my first comment'}

        await crudCommentService.createNewComment(dto)

        const commentId = dataSoruce.getRepository(CommentEnity)
        const response = await commentId.findOne({
            where: {postId: dto.postId}
        })

        expect(response).toBeDefined()
        expect(response?.postId).toEqual(dto.postId)    
    })


    it('test update comment', async () => {
        const updated_dto = {postId: 1, id: 1, content: 'i change this comment'}

        await crudCommentService.updateComment(updated_dto)

        const dataSouceComment = dataSoruce.getRepository(CommentEnity)
        const response = await dataSouceComment.findOne({
            where: {postId: updated_dto.postId}
        })

        expect(response).toBeDefined()
        expect(response?.content).toEqual(updated_dto.content)
    })

    it('test inital CommentData', async () => {
        const dto = {postId: 1}

        const response = await commentService.getInitialCommentData(dto)

        const {createdAt, updatedAt} = response[0]

        expect(createdAt).toMatchObject({
            seconds: expect.any(Number),
            nanos: expect.any(Number)
        })
        expect(updatedAt).toMatchObject({
            seconds: expect.any(Number),
            nanos: expect.any(Number)
        })

        expect(response).toBeDefined()
        expect(response).toMatchObject<CommentEnity_Proto[]>([{
            id: expect.any(Number), createdAt: expect.any(Object), updatedAt: expect.any(Object), postId: expect.any(Number),
            userId: expect.any(Number), content: expect.any(String)
        }])
    })

    it('test inital otherData', async () => {
        const dto  = {postId: 1, lastId: 0}

        const response = await commentService.getOtherPartComment(dto)

        expect(response).toBeDefined()
        expect(response).toMatchObject<CommentEnity_Proto[]>([{
            id: expect.any(Number), createdAt: expect.any(Object), updatedAt: expect.any(Object), postId: expect.any(Number),
            userId: expect.any(Number), content: expect.any(String)
        }])
    })

    it('test delete comment', async () => {
    const delete_dto = {id: 1, postId: 1}

    await crudCommentService.deleteComment(delete_dto)

    const dataSourceDelete = dataSoruce.getRepository(CommentEnity)
    const response = await dataSourceDelete.findOne({
        where: {postId: delete_dto.postId}
    })

    expect(response).toBeNull()
})
})