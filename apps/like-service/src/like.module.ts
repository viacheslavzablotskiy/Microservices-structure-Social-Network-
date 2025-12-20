import { Module } from '@nestjs/common';
import { LikeController } from './like.controller';
import { LikeService } from './providers/like.service';
import {ConfigModule, ConfigService} from '@nestjs/config'
import {TypeOrmModule} from '@nestjs/typeorm'
import { LikeEntity } from './entities/like.entity';
import {CachePackageMdoule} from '@repo/chache-package'
import { ClientsModule, Transport } from '@nestjs/microservices'
import {ConnectionModule} from "@repo/rabbitmq-package"

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
        migrationsRun: true,
        synchronize: false,
        logging: true
      })
    }),
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
  controllers: [LikeController],
  providers: [LikeService],
})
export class AppModule {}
