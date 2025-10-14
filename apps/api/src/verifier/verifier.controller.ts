import { Controller, Post, Get, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { VerifierService } from './verifier.service';
import { ApiKeyGuard } from './api-key.guard';
import type { VerifiableCredential } from '@veritas/types';

@Controller('verifier')
export class VerifierController {
  constructor(private readonly verifierService: VerifierService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() body: { email: string; password: string }) {
    const apiKey = await this.verifierService.createAccount(body.email, body.password);
    return {
      apiKey,
      message: 'Account created successfully. Fund your account to start verifying credentials.',
    };
  }

  @Post('fund')
  @UseGuards(ApiKeyGuard)
  @HttpCode(HttpStatus.OK)
  async fund(@Req() req: any, @Body() body: { amount: number }) {
    await this.verifierService.addFunds(req.verifier.sub, body.amount);
    const balance = this.verifierService.getBalance(req.verifier.sub);
    return {
      balance,
      message: `${body.amount} $VERI added to your account`,
    };
  }

  @Post('verify')
  @UseGuards(ApiKeyGuard)
  @HttpCode(HttpStatus.OK)
  @SkipThrottle() // Verifiers pay per use, so we skip throttling
  async verify(@Req() req: any, @Body() body: { credential: VerifiableCredential }) {
    return await this.verifierService.verifyCredentialWithFee(
      req.verifier.sub,
      body.credential
    );
  }

  @Get('balance')
  @UseGuards(ApiKeyGuard)
  async getBalance(@Req() req: any) {
    const balance = this.verifierService.getBalance(req.verifier.sub);
    return { balance };
  }
}
