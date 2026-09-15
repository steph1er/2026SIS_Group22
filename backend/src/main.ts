import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { transform } from 'typescript';

/* set up validation pipeline - https://docs.nestjs.com/techniques/validation#auto-validation */

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    }
  }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
