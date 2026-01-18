import { NestFactory } from '@nestjs/core';
import { AppModule } from './comment.module';
import {ConfigService} from '@nestjs/config'
import {MicroserviceOptions, Transport} from '@nestjs/microservices'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'distcomment',
      protoPath: require.resolve('@repo/proto/dist-comment.proto'),
      url: '0.0.0.0:5003'
    }
  })

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'comments_queue',
      noAck: false,
      exchangeType: 'direct',
      exchange: 'comment_exchange',
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

  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT', 3000)

  console.log(port);
  

  app.startAllMicroservices()

  await app.listen(port);
}
bootstrap();
