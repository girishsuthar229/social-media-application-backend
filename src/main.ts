import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ResponseInterceptor } from './interceptors';
import { join } from 'path';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  function getFirstError(
    errors: ValidationError[],
    parentPath = '',
  ): { path: string; message: string } {
    const error = errors[0];
    const currentPath = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    if (error.constraints) {
      const msg = Object.values(error.constraints)[0];
      return { path: currentPath, message: msg };
    }

    if (error.children?.length) {
      return getFirstError(error.children, currentPath);
    }

    return { path: currentPath, message: '' };
  }
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const { message } = getFirstError(errors);
        return new BadRequestException(message);
      },
    }),
  );
  app.enableCors();
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });
  await app.listen(process.env.PORT ?? 3000);
  // await app.listen(process.env.PORT ?? 3000, '192.168.3.99');
}

bootstrap();
