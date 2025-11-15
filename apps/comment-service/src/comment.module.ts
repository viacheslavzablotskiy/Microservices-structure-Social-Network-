import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './providers/comment.service';
import { CrudCommentService } from './providers/crud.comment.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm'
import { CommentEnity } from './entitis/comment.entity';

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
        synchronize: false,
        logging: true
      })
    })
  ],
  controllers: [CommentController],
  providers: [CommentService, CrudCommentService],
})
export class AppModule {}
