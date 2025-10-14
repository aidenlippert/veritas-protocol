import { Injectable } from '@nestjs/common';
import { issueCredential } from '@veritas/sdk-issuer';
import type { GitHubReputationSubject } from '@veritas/types';

@Injectable()
export class AuthService {
  async issueGitHubCredential(user: any): Promise<string> {
    const subject: GitHubReputationSubject = {
      id: user.did,
      username: user.username,
      profileUrl: user.profileUrl,
      reputation: {
        followers: user.followers,
        publicRepos: user.publicRepos,
        accountAge: this.calculateAccountAge(user.createdAt),
      },
      verifiedAt: new Date().toISOString(),
    };

    const vcJws = await issueCredential({
      type: 'GitHubReputation',
      subject,
      issuerDid: process.env.ISSUER_DID!,
      issuerPrivateKey: process.env.ISSUER_PRIVATE_KEY!,
      expiresInDays: 90, // GitHub credentials expire in 90 days
    });

    return vcJws;
  }

  private calculateAccountAge(createdAt: string): number {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}
