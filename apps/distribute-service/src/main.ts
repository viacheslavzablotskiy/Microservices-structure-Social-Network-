import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ConfigService} from '@nestjs/config'
import {MicroserviceOptions, Transport} from '@nestjs/microservices'
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true, 
  })

  app.use(cookieParser());

  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT', 3000)
  console.log(port);
  
  await app.startAllMicroservices()
  await app.listen(port);
}
bootstrap();
