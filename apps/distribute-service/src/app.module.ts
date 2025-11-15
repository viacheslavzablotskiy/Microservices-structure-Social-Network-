import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './providers/auth.service';
import {ConfigModule} from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices';

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
          url: '0.0.0.0.5001'
        }
      },
      {
        name: 'DIST-COMMENT-PATH',
        transport: Transport.GRPC,
        options: {
          package: 'distcomment',
          protoPath: require.resolve('@repo/proto/dist-comment.proto'),
          url: '0.0.0.0.5003'
        }
      },
      {
        name: 'DIST-LIKE-PATH',
        transport: Transport.GRPC,
        options: {
          package: 'distlike',
          protoPath: require.resolve('@repo/proto/dist-like.proto'),
          url: '0.0.0.0.5002'
        }
      }
    ])
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AppModule {}
