import { Injectable } from '@nestjs/common';
import {
  issueCredential,
  createDIDFromAddress,
  getAddressFromPrivateKey,
} from '@veritas/sdk-issuer';
import type { ProofOfEmploymentSubject } from '@veritas/types';

export interface IssueCredentialOptions {
  holderDID: string;
  claims: Omit<ProofOfEmploymentSubject, 'id'>;
  expirationDate?: string;
}

@Injectable()
export class CredentialService {
  private readonly issuerPrivateKey: string;
  private readonly issuerDID: string;

  constructor() {
    // Load issuer credentials from environment
    this.issuerPrivateKey = process.env.ISSUER_PRIVATE_KEY || this.generateDevKey();

    // Create DID from the private key
    const issuerAddress = getAddressFromPrivateKey(this.issuerPrivateKey);
    this.issuerDID = createDIDFromAddress(issuerAddress);

    console.log(`Issuer initialized with DID: ${this.issuerDID}`);
  }

  async issueCredential(options: IssueCredentialOptions) {
    const subject: ProofOfEmploymentSubject = {
      id: options.holderDID,
      ...options.claims,
    };

    return issueCredential({
      type: 'ProofOfEmployment',
      subject,
      issuerPrivateKey: this.issuerPrivateKey,
      issuerDid: this.issuerDID,
      expiresInDays: options.expirationDate ? undefined : 365,
    });
  }

  /**
   * Generate a development key for testing
   * NEVER use this in production!
   */
  private generateDevKey(): string {
    console.warn('⚠️  Using development key. Set ISSUER_PRIVATE_KEY in production!');
    // This is a deterministic test key
    return '0x0123456789012345678901234567890123456789012345678901234567890123';
  }
}
