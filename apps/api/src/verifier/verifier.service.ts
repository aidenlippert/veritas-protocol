import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verifyCredential } from '@veritas/sdk-verifier';
import type { VerifiableCredential } from '@veritas/types';
import * as bcrypt from 'bcrypt';

// In-memory store for demo - replace with PostgreSQL in production
interface VerifierAccount {
  id: string;
  email: string;
  passwordHash: string;
  balance: number; // $VERI tokens
  createdAt: Date;
}

@Injectable()
export class VerifierService {
  private accounts = new Map<string, VerifierAccount>();
  private readonly VERIFICATION_FEE = 1; // 1 $VERI per verification

  constructor(private jwtService: JwtService) {}

  async createAccount(email: string, password: string): Promise<string> {
    // Check if account exists
    const existingAccount = Array.from(this.accounts.values()).find(
      (acc) => acc.email === email
    );

    if (existingAccount) {
      throw new BadRequestException('Account already exists');
    }

    // Create account
    const id = this.generateId();
    const passwordHash = await bcrypt.hash(password, 10);

    const account: VerifierAccount = {
      id,
      email,
      passwordHash,
      balance: 0,
      createdAt: new Date(),
    };

    this.accounts.set(id, account);

    // Generate API key (JWT)
    const apiKey = await this.jwtService.signAsync(
      { sub: id, email },
      { secret: process.env.JWT_SECRET, expiresIn: '365d' }
    );

    return apiKey;
  }

  async addFunds(verifierId: string, amount: number): Promise<void> {
    const account = this.accounts.get(verifierId);
    if (!account) {
      throw new BadRequestException('Account not found');
    }

    account.balance += amount;
  }

  async verifyCredentialWithFee(
    verifierId: string,
    credential: VerifiableCredential
  ): Promise<any> {
    const account = this.accounts.get(verifierId);
    if (!account) {
      throw new BadRequestException('Account not found');
    }

    // Check balance
    if (account.balance < this.VERIFICATION_FEE) {
      throw new HttpException('Insufficient $VERI balance', HttpStatus.PAYMENT_REQUIRED);
    }

    // Deduct fee
    account.balance -= this.VERIFICATION_FEE;

    // Perform verification
    const result = await verifyCredential({ credential });

    return {
      ...result,
      feeCharged: this.VERIFICATION_FEE,
      remainingBalance: account.balance,
    };
  }

  getBalance(verifierId: string): number {
    const account = this.accounts.get(verifierId);
    if (!account) {
      throw new BadRequestException('Account not found');
    }
    return account.balance;
  }

  private generateId(): string {
    return `verifier_${Math.random().toString(36).substr(2, 9)}`;
  }
}
