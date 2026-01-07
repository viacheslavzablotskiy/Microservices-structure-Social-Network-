import { NestFactory } from '@nestjs/core';
import { AppModule } from './chat.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  const config = app.get(ConfigService)
  const port = config.get<number>('PORT', 3000)

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: config.get<string>('REDIS_HOST', 'localhost'),
      port: config.get<number>('REDIS_PORT', 6379),
      retryAttempts: 3,
      retryDelay: 3000,
      wildcards: true
    }
  })

  console.log(port);
  
  app.startAllMicroservices()
  await app.listen(port);
}
bootstrap();
