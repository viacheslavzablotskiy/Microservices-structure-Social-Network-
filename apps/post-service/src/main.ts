import { NestFactory } from '@nestjs/core';
import { AppModule } from './post.module';
import {ConfigService} from '@nestjs/config'
import {MicroserviceOptions, Transport} from '@nestjs/microservices'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'distpost',
      protoPath: require.resolve('@repo/proto/dist-post.proto'),
      url: '0.0.0.0.5001'
    }
  })

  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT', 3000)


  await app.startAllMicroservices()
  await app.listen(port);
}
bootstrap();