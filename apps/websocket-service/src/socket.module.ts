import { Module } from '@nestjs/common';
import { ScoketService } from './providers/socket.service';
import {ConfigModule, ConfigService} from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import {StringValue} from 'ms'
import {AuthStragetyModule} from '@repo/api'
import {createClient} from 'redis'

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    ClientsModule.registerAsync([
    {
      name: 'REDIS_INSTANCE',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: Transport.REDIS,
        options: {
          host: config.get<string>('REDIS_HOST') ?? 'localhost',
          port: config.get<number>('REDIS_PORT') ?? 6379
        },
      }),
    },
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', ''),
        signOptions: {expiresIn: config.get<StringValue>('JWT_EXPIRES_IN', '5m')}
      })
    }),
    AuthStragetyModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({refrechTokenSecret: config.get<string>('JWT_REFRESH_SECRET', '')})
    }),
    ClientsModule.register([
      {
        name: 'WEBSOCKET-CHAT-PATH',
        transport: Transport.GRPC,
        options: {
            package: 'websocketchat',
            protoPath: '@repo/proto/websocket-chat.proto',
            url: '0.0.0.0:5010'
        }
      },
      {
        name: 'WEBSCOKET-GROUP-PATH',
        transport: Transport.GRPC,
        options: {
          package: '',
          protoPath: '',
          url: '0.0.0.0:5011'
        }
      }
    ])
  ],
  controllers: [],
  providers: [ScoketService,
    {
      provide: 'REDIS_CLIENT_INSTANCE',
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const client = createClient({url: config.get<string>('REDIS_URL_PATH', '')})
        client.on('error', (error) => {console.error(error)})
        await client.connect()
        return client
      }
    }
  ],
})
export class AppModule {}

