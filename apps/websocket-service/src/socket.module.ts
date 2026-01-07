import { Module } from '@nestjs/common';
import { ScoketService } from './providers/socket.service';
import {ConfigModule, ConfigService} from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices';

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
    ])
  ],
  controllers: [],
  providers: [ScoketService],
})
export class AppModule {}

