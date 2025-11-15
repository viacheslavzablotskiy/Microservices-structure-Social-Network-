import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserService } from './providers/app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm'
import { UserEntity } from './entities/user.entity';
import { UserProfileEntity } from './entities/user.profile.entity';
import { UserSecurityEntity } from './entities/user.security.entity';
import { UserSettingsEntity } from './entities/user.settings.entity';
import { UserStatsEntity } from './entities/user.stats.entity';
import { UserRealationEntity } from './entities/user.relations.entity';
import {CachePackageMdoule} from '@repo/chache-package'

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}),
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
        database: config.get<string>('DB_NAME'),
        entities: ['dist/**/*.entity{.js,.ts}'],
        migrations: ['dist/src/migrations/*{.js,.ts}'],
        migrationsTableName: '_migrations',
        migrationsRun: true,
        synchronize: false,
        logging: true
      })
    }),
    // CachePackageMdoule.registerAsync({
    //   inject: [ConfigService],
    //   useFactory: (config: ConfigService) => ({
    //     REDIS_URL: config.get<string>('REDIS_URL_PATH') || ''
    //   })
    // })
  ],
  controllers: [AppController],
  providers: [UserService],
})
export class AppModule {}
