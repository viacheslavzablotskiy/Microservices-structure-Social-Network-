import { Module } from '@nestjs/common';
import { AppController } from './post.controller';
import { PostService } from './providers/main.service';
import { CrudService } from './providers/crud.service';
import {ConfigModule, ConfigService} from '@nestjs/config'
import {TypeOrmModule} from '@nestjs/typeorm'
import { PostEntity } from './entities/post.entity';

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forFeature([PostEntity]),
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
        migrationsTableName: '_migrationsPost',
        synchronize: false,
        logging: true
      })
    })
  ],
  controllers: [AppController],
  providers: [PostService, CrudService],
})
export class AppModule {}
