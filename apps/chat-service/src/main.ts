import { NestFactory } from '@nestjs/core';
import { AppModule } from './chat.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  const config = app.get(ConfigService)
  const port = config.get<number>('PORT', 3000)

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'websocketchat',
      protoPath: require.resolve('@repo/proto/websocket-chat.proto'),
      url: '0.0.0.0:5010'
    }
  })

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'websocketgroup',
      protoPath: require.resolve('@repo/proto/websocket-chat.proto'),
      url: '0.0.0.0:5011'
    }
  })

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'distchat',
      protoPath: require.resolve('@repo/proto/dist-chat.proto'),
      url: '0.0.0.0:5012'
    }
  })

  console.log(port);
  
  app.startAllMicroservices()
  await app.listen(port);
}
bootstrap();
