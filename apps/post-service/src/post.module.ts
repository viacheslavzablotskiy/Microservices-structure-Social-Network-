import { Module } from '@nestjs/common';
import { AppController } from './post.controller';
import { PostService } from './providers/main.service';
import { CrudService } from './providers/crud.service';
import {ConfigModule, ConfigService} from '@nestjs/config'
import {TypeOrmModule} from '@nestjs/typeorm'
import { PostEntity } from './entities/post.entity';
import { CachePackageMdoule } from '@repo/chache-package'
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forFeature([PostEntity]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: ['dist/**/*.entity{.js,.ts}'],
        migrations: ['dist/src/migrations/*{.js,.ts}'],
        migrationsTableName: '_migrationsPost',
        migrationsRun: true,
        synchronize: false,
        logging: true
      })
    }),
    CachePackageMdoule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        REDIS_URL: config.get<string>('REDIS_URL_PATH') || ''
      })
    }),
    ClientsModule.register([
      {
        name: 'DELETE_COMMENTS',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'comments_queue',
          exchangeType: 'direct',
          exchange: 'comment_exchange',
          queueOptions: {
            durable: true, 
            autoDelete: false,
            arguments: {
              'x-message-ttl' : 60000, //x-message-age: <> for stream queue
              'x-max-length': 1000, // x-message-length-bytes: <> for stream queue
              'x-dead-letter-exchange': 'errors_exchange', // we dotn have DLX in stream
              'x-dead-letter-routing-key': 'errors_key'
            } 
          }
        }
      },
      {
        name: 'DELETE_COMMENT_COUNT_CACHE',
        transport: Transport.RMQ,
        options: {
          urls:  ['amqp://localhost:5672'],
          queue: 'comment.count.queue',
          exchange: 'cache_exchange',
          exchangeType: 'direct',
          queueOptions: {
            durable: true,
            autoDelete: false,
            arguments: {
              'x-message-ttl' : 60000, //x-message-age: <> for stream queue
              'x-max-length': 1000, // x-message-length-bytes: <> for stream queue
              'x-dead-letter-exchange': 'errors_exchange',
              'x-dead-letter-routing-key': 'errors_key'
            }
        }
    }
      },
     {
      name: 'DELETE_LIKE_COUNT_CACHE',
      transport: Transport.RMQ,
      options: {
      urls:  ['amqp://localhost:5672'],
        queue: 'like.count.queue',
        exchange: 'cache_exchange',
        exchangeType: 'direct',
        queueOptions: {
          durable: true,
          autoDelete: false,
          arguments: {
            'x-message-ttl' : 60000, //x-message-age: <> for stream queue
            'x-max-length': 1000, // x-message-length-bytes: <> for stream queue
            'x-dead-letter-exchange': 'errors_exchange',
            'x-dead-letter-routing-key': 'errors_key'
          }
      }
    }
     },
    {
        name: 'DELETE_CACHE_PAGE_1',
        transport: Transport.RMQ,
        options: {
          urls:  ['amqp://localhost:5672'],
          queue: 'comment.page.queue',
          exchange: 'cache_exchange',
          exchangeType: 'direct',
          queueOptions: {
            durable: true,
            autoDelete: false,
            arguments: {
              'x-message-ttl' : 60000, //x-message-age: <> for stream queue
              'x-max-length': 10000, // x-message-length-bytes: <> for stream queue
              'x-dead-letter-exchange': 'errors_exchange',
              'x-dead-letter-routing-key': 'errors_key'
            }
        }
    }
      },
    ])
  ],
  controllers: [AppController],
  providers: [PostService, CrudService],
})
export class AppModule {}
