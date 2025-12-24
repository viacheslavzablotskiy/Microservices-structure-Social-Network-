import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './providers/auth.service';
import {ConfigModule, ConfigService} from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthStragetyModule } from '@repo/api';
import { JwtModule } from '@nestjs/jwt';
import {StringValue} from 'ms'
import { MainCommentController } from './controllers/comments.controller';
import { MainCommentService } from './providers/comment.service';
import { MainLikeController } from './controllers/like.controller';
import { MainPostCOntriller } from './controllers/post.controller';
import { MainPostService } from './providers/post.service';
import { LikeMainService } from './providers/like.service';
import { AuthLoggerMiddlware, AuthTokenAuthorization } from './distribute.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    ClientsModule.register([
      {
        name: 'DIST-AUTH-PATH',
        transport: Transport.GRPC,
        options: {
          package: 'distauth',
          protoPath: require.resolve('@repo/proto/dist-auth.proto'),
          url: '0.0.0.0:5000'
        },
      },
      {
        name: 'DIST-POST-PATH',
        transport: Transport.GRPC,
        options: {
          package: 'distpost',
          protoPath: require.resolve('@repo/proto/dist-post.proto'),
          url: '0.0.0.0:5001'
        }
      },
      {
        name: 'DIST-COMMENT-PATH',
        transport: Transport.GRPC,
        options: {
          package: 'distcomment',
          protoPath: require.resolve('@repo/proto/dist-comment.proto'),
          url: '0.0.0.0:5003'
        }
      },
      {
        name: 'DIST-LIKE-PATH',
        transport: Transport.GRPC,
        options: {
          package: 'distlike',
          protoPath: require.resolve('@repo/proto/dist-like.proto'),
          url: '0.0.0.0:5002'
        }
      }
    ]),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || '',
        signOptions: {expiresIn: configService.get<StringValue>('JWT_EXPIRES_IN') || '100s'}
      })
    }),
    AuthStragetyModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        refrechTokenSecret: config.get<string>('JWT_REFRESH_SECRET') || ''
      })
    })
  ],
  controllers: [AuthController, MainCommentController, MainPostCOntriller, MainLikeController],
  providers: [AuthService, MainCommentService, MainPostService, LikeMainService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthLoggerMiddlware).exclude().forRoutes(AuthController)
    consumer.apply(AuthLoggerMiddlware, AuthTokenAuthorization).exclude().forRoutes(MainLikeController,
      MainCommentController, MainPostCOntriller
    )
  }
}
