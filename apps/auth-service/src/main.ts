import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService} from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log(require.resolve('@repo/proto/auth.proto'))  
  console.log(require.resolve('@repo/proto/dist-auth.proto'));
  

  app.use(cookieParser());

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'distauth',
      protoPath: require.resolve('@repo/proto/dist-auth.proto'),
      url: '0.0.0.0:5000'
    }
  })

  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.RMQ,
  //   options: {
  //         urls: ['amqp://localhost:5672'],
  //         queue: 'user_queue',
  //         noAck: false, 
  //         queueOptions: {
  //           durable: true,  /// all left if you restart rabbit
  //           arguments: {
  //             'x-dead-letter-exchange': 'my.dead.letter.exchange',
  //             'x-dead-letter-routing-key': 'my.dead.letter.queue'
  //           }
  //         }
  //       }
  // })

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true, 
  })

  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT', 3000) 

  console.log(port);
  await app.startAllMicroservices()
  await app.listen(port);
}
bootstrap();
