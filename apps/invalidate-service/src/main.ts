import { NestFactory } from '@nestjs/core';
import { AppModule } from './invalidate.module';
import {ConfigService} from '@nestjs/config'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls:  ['amqp://localhost:5672'],
      queue: 'comment.count.queue',
      noAck: false,
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
  })

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls:  ['amqp://localhost:5672'],
      queue: 'like.count.queue',
      noAck: false,
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
  })

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls:  ['amqp://localhost:5672'],
      queue: 'user.login.queue',
      noAck: false,
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
  })

  const config = app.get(ConfigService)
  const port = config.get<number>('PORT', 3000)

  app.startAllMicroservices()

  await app.listen(port);
}
bootstrap();
