import { NestFactory } from '@nestjs/core';
import { AppModule } from './invalidate.module';
import {ConfigService} from '@nestjs/config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService)
  const port = config.get<number>('PORT', 3000)

  // app.startAllMicroservices()

  await app.listen(port);
}
bootstrap();
