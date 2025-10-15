import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CRITICAL: Enable CORS BEFORE Helmet
  app.enableCors({
    origin: (origin, callback) => {
      console.log(`[CORS] Origin check: ${origin}`);
      if (!origin) {
        console.log('[CORS] No origin - allowing');
        return callback(null, true);
      }
      const isAllowed = origin.includes('vercel.app') || origin.includes('localhost') || origin.includes('veritas://');
      console.log(`[CORS] Origin ${origin} allowed: ${isAllowed}`);
      callback(null, isAllowed);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Security headers - AFTER CORS, with CSP disabled for JSON API
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 API running on port ${process.env.PORT ?? 3000}`);
  console.log('CORS enabled for all Vercel deployments');
}
bootstrap();
