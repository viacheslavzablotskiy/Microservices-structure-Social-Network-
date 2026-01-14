import { Module } from '@nestjs/common';
import { GroupSerivce } from './providers/group/group.socket.service';
import {ConfigModule, ConfigService} from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import {StringValue} from 'ms'
import {AuthStragetyModule} from '@repo/api'
import {createClient} from 'redis'
import { ChatGPRCService } from './providers/chat/chat.grpc.provider';
import { ChatSocketService } from './providers/chat/chat.socket.provider';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
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
            protoPath: require.resolve('@repo/proto/websocket-chat.proto'),
            url: '0.0.0.0:5010'
        }
      },
      {
        name: 'WEBSCOKET-GROUP-PATH',
        transport: Transport.GRPC,
        options: {
          package: 'websocketgroup',
          protoPath: require.resolve('@repo/proto/websocket-group.proto'),
          url: '0.0.0.0:5011'
        }
      }
    ])
  ],
  controllers: [],
  providers: [GroupSerivce, ChatGPRCService, ChatSocketService,
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

