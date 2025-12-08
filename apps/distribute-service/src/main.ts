import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ConfigService} from '@nestjs/config'
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger"
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configDocumentation = new DocumentBuilder()
  .setTitle('My Api GateWay')
  .setDescription('API Gateway Description')
  .setVersion('1.0')
  .addBearerAuth({
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Enter your jwt'
  }, 'auth-part')
  .addCookieAuth(
    'refresh_token', {
      type: 'apiKey',
      in: 'cookie',
      description: 'Refresh token cookie'
    }
  )
  .addGlobalResponse(
    {
      status: 500,
      description: 'server error'
    },
    {
      status: 403,
      description: 'forbiden'
    }
  )
  .build()

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true, 
  })

  app.use(cookieParser());

  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT', 3000)
  console.log(port);

  const document = SwaggerModule.createDocument(app, configDocumentation)
  SwaggerModule.setup('api', app, document)
  
  await app.startAllMicroservices()
  await app.listen(port);
}
bootstrap();
