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
  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT', 3000)

  console.log(port);
  

  app.startAllMicroservices()
  await app.listen(port);
}
bootstrap();
