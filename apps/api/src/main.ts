import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001', 'veritas://'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 API running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
