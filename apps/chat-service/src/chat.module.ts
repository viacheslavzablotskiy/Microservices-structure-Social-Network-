import { Module } from '@nestjs/common';
import { AppController } from './controllers/chat.controller';
import { AppService } from './providers/chat.service';
import {ConfigModule, ConfigService} from '@nestjs/config'
import {MongooseModule} from '@nestjs/mongoose'
import { Room, RoomSchema } from './enities/room.entity';
import { Message, MessageSchema } from './enities/message.entity';

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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
