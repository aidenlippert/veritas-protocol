import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet());

  // CORS - Allow all Vercel preview deployments
  const corsOrigins = process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || ['http://localhost:3001', 'veritas://'];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc)
      if (!origin) return callback(null, true);

      // Check if origin matches our allowed origins or is a Vercel deployment
      const isAllowed = corsOrigins.some(allowed => origin === allowed) ||
                        (origin.includes('veritas-protocol') && origin.includes('vercel.app'));

      console.log(`CORS check for ${origin}: ${isAllowed}`);

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });
  console.log('CORS enabled for:', corsOrigins, '+ all vercel.app deployments');

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 API running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
