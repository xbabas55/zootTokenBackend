
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import '../library/common/logger-patch';

async function bootstrap() {
  
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const logger = new (await import('@nestjs/common')).Logger('Bootstrap');
  
  logger.log('Application is starting...');

   app.enableCors({
     origin: [
      'http://localhost:3000',
      'http://170.205.30.221:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  await app.listen(5000, '0.0.0.0');
  logger.log('Application is running on http://170.205.30.221:5000');
}
bootstrap();