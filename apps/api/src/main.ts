import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet());

  // CORS
  const corsOrigins = process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || ['http://localhost:3001', 'veritas://'];
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });
  console.log('CORS enabled for:', corsOrigins);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 API running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
