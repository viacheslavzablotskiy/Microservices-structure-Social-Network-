import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService} from '@nestjs/config';
import {Transport, type MicroserviceOptions} from '@nestjs/microservices'
import { join } from 'path';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: require.resolve('@repo/proto/auth.proto'),
      url: '0.0.0.0.5004'
    }
  })

  const configeService = app.get(ConfigService)
  const port = configeService.get<number>('PORT', 3001)

  console.log('Port of the user-service', port);

  await app.startAllMicroservices()
  await app.listen(port);
}
bootstrap();
