import { Module } from '@nestjs/common';
import { CommentController } from './controllers/comment.controller';
import { CommentService } from './providers/comment.service';
import { CrudCommentService } from './providers/crud.comment.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm'
import { CommentEnity } from './entitis/comment.entity';
import {CachePackageMdoule} from "@repo/chache-package"
import EventCommentService from './providers/eventPatter.comment';
import {ConnectionModule} from '@repo/rabbitmq-package'
import { RpcExceptionFilter } from '@repo/api';
import { CacheInterceptorPage } from './settings/main.interceptors';
import { ClientsModule, Transport } from '@nestjs/microservices';
@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forFeature([CommentEnity]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: ['dist/**/*.entity{.js,.ts}'],
        migrations: ['dist/src/migrations/*{.js,.ts}'],
        migrationsTableName: '_migrationsComment',
        migrationsRun: true,
        synchronize: false,
        logging: true
      })
    }),
    ClientsModule.register([
      {
        name: 'DIST-USER-PATH',
        transport: Transport.GRPC,
        options: {
          package: 'distuser',
          protoPath: require.resolve('@repo/proto/dist-user.proto'),
          url: '0.0.0.0:5020'
        }
      }
    ]),
    CachePackageMdoule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        REDIS_URL: config.get<string>('REDIS_URL_PATH') || ''
      })
    }),
    ConnectionModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({RABBITMQ_URL: config.get<string>('RABBIT_MQ_PATH') || ''})
    })
  ],
  controllers: [CommentController],
  providers: [CommentService, CrudCommentService, EventCommentService,
     RpcExceptionFilter, CacheInterceptorPage],
})
export class AppModule {}
