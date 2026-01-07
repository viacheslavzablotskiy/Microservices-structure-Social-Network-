import { Module } from '@nestjs/common';
import { AppController } from './controllers/chat.controller';
import { AppService } from './providers/chat.service';
import {ConfigModule, ConfigService} from '@nestjs/config'
import {MongooseModule} from '@nestjs/mongoose'

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: `mongodb://${config.get<string>('MONGO_HOST')}:${config.get<string>('MONGO_PORT')}/${config.get<string>('MONGO_DB')}`,
        user: config.get<string>('MONGO_USER'),
        pass: config.get<string>('MONGO_PASS'),
        authSource: config.get<string>('MONGO_AUTH_SOURCE'),
        autoCreate: false,
        autoIndex: false,
        bufferCommands: false
        // connectionFactory: (connection) => {
        //   connection.plugin(require('mongoose-autopopulate'))
        //   return connection
        // }
      })
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
