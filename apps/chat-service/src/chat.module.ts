import { Module } from '@nestjs/common';
import { ChatController } from './controllers/chat.controller';
import { ChatService } from './providers/chat.service';
import {ConfigModule, ConfigService} from '@nestjs/config'
import {MongooseModule} from '@nestjs/mongoose'
import { Room, RoomSchema } from './enities/room.entity';
import { Message, MessageSchema } from './enities/message.entity';
import { createClient } from 'redis';

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}),
    MongooseModule.forFeature([{name: Room.name, schema: RoomSchema}, {name: Message.name, schema: MessageSchema}]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: `mongodb://${config.get<string>('MONGO_USER')}:${config.get<string>('MONGO_PASS')}
        @${config.get<string>('REPLICA_SETS_HOSTS')}/${config.get<string>('MONGO_DB')}`,
        authSource: config.get<string>('MONGO_AUTH_SOURCE'),
        replicaSet: config.get<string>('REPLICA_SETS_NAME'),
        autoCreate: false,
        autoIndex: false,
        bufferCommands: false
      })
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService, 
    {
      provide: 'REDIS_PUBLISH_INSTANCE',
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
