import { Module } from '@nestjs/common';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';
import {ConfigModule, ConfigService} from '@nestjs/config'
import {TypeOrmModule} from '@nestjs/typeorm'
import { LikeEntity } from './entities/like.entity';

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forFeature([LikeEntity]),
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
        migrationsTableName: '_migrationsLike',
        synchronize: false,
        logging: true
      })
    })
  ],
  controllers: [LikeController],
  providers: [LikeService],
})
export class AppModule {}
