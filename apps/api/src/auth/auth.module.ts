import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GitHubStrategy } from './github.strategy';

const providers: any[] = [AuthService];

// Only enable GitHub OAuth if credentials are configured
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(GitHubStrategy);
}

@Module({
  imports: [PassportModule],
  controllers: [AuthController],
  providers,
  exports: [AuthService],
})
export class AuthModule {}
