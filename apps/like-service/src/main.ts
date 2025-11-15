import { NestFactory } from '@nestjs/core';
import { AppModule } from './like.module';
import { ConfigService } from '@nestjs/config';
import {MicroserviceOptions, Transport} from '@nestjs/microservices'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.GRPC,
      options: {
        package: 'distlike',
        protoPath: require.resolve('@repo/proto/dist-like.proto'),
        url: '0.0.0.0.5002'
      }
    }
  )

  const configStervice = app.get(ConfigService)
  const port = configStervice.get<number>('PORT', 3000)

  app.startAllMicroservices()
  await app.listen(port);
}
bootstrap();
