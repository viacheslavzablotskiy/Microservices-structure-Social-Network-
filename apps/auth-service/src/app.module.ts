import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {JwtModule} from '@nestjs/jwt'
import {StringValue} from 'ms'
import { HttpModule } from '@nestjs/axios';
import { AuthStragetyModule } from '@repo/api';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {CachePackageMdoule} from '@repo/chache-package' 

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || '',
        signOptions: {expiresIn: configService.get<StringValue>('JWT_EXPIRES_IN') || '100s'}
      })
    }),
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        baseURL: config.get<string>('AUTH_SERVICE_URL'),
        timeout: config.get<number>('HTTP_TIMEOUT'),
        maxRedirects: config.get<number>('AUTH_MAX_REDIRECTS')
      })
    }),
    AuthStragetyModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        refrechTokenSecret: config.get<string>('JWT_REFRESH_SECRET') || ''
      })
    }),
    ClientsModule.register([
      {
        name: 'AUTH-USER-PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: require.resolve('@repo/proto/auth.proto'),
          url: '0.0.0.0:5004'
        }
      },
      // {
      //   name: 'AUTH_RABBITMQ_USER',
      //   transport: Transport.RMQ,
      //   options: {
      //     urls: ['amqp://localhost:5672'],
      //     queue: 'user_queue',
      //     noAck: false, 
      //     queueOptions: {
      //       durable: true,  /// all left if you restart rabbit
      //       arguments: {
      //         'x-dead-letter-exchange': 'my.dead.letter.exchange',
      //         'x-dead-letter-routing-key': 'my.dead.letter.queue'
      //       }
      //     }
      //   }
      // }
    ]),
    CachePackageMdoule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        REDIS_URL: config.get<string>('REDIS_URL_PATH') || ''
      })
    })
  ],
  controllers: [AppController],
  providers: [AuthService],
})
export class AppModule {}



