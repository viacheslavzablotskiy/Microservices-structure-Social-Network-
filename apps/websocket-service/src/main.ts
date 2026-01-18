import { NestFactory } from '@nestjs/core';
import { AppModule } from './socket.module';
import {ConfigService} from '@nestjs/config'
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  const corsOption: CorsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'PATCH']
  }
  app.enableCors(corsOption)
  const config = app.get(ConfigService)
  const port = config.get<number>('PORT', 3000)

  await app.listen(port);
}
bootstrap();
