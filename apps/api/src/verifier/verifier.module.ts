import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { VerifierController } from './verifier.controller';
import { VerifierService } from './verifier.service';
import { ApiKeyGuard } from './api-key.guard';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
      signOptions: { expiresIn: '365d' },
    }),
  ],
  controllers: [VerifierController],
  providers: [VerifierService, ApiKeyGuard],
  exports: [VerifierService],
})
export class VerifierModule {}
