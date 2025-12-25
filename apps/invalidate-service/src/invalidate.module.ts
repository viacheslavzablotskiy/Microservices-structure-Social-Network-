import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {CachePackageMdoule} from '@repo/chache-package'
import { InvalidateCommentService } from './providers/inv_comment.service';
import { InvalidateLikeService } from './providers/inv_like.service';
import { InvalidateUserService } from './providers/inv_user.service';
import {ConnectionModule} from '@repo/rabbitmq-package'
import { InvalidatePostService } from './providers/inv_post.service';

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}),
    CachePackageMdoule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        REDIS_URL: config.get<string>('REDIS_URL_PATH') || ''
      })
    }),
    ConnectionModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({RABBITMQ_URL: config.get<string>('RABBIT_MQ_URL') || ''})
    })
  ],
  providers: [InvalidateCommentService, InvalidateLikeService,
     InvalidateUserService, InvalidatePostService],
})
export class AppModule {}
