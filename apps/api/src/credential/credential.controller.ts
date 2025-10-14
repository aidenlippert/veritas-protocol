import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CredentialService } from './credential.service';
import type { ProofOfEmploymentSubject } from '@veritas/types';

export class IssueCredentialDto {
  holderDID: string;
  employer: string;
  role: string;
  startDate: string;
  endDate?: string;
  expirationDate?: string;
}

@Controller('credentials')
export class CredentialController {
  constructor(private readonly credentialService: CredentialService) {}

  @Post('issue')
  @HttpCode(HttpStatus.OK)
  async issueCredential(@Body() dto: IssueCredentialDto) {
    const claims: Omit<ProofOfEmploymentSubject, 'id'> = {
      employer: dto.employer,
      role: dto.role,
      startDate: dto.startDate,
      endDate: dto.endDate,
    };

    const credential = await this.credentialService.issueCredential({
      holderDID: dto.holderDID,
      claims,
      expirationDate: dto.expirationDate,
    });

    return {
      success: true,
      credential,
    };
  }
}
