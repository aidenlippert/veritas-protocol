import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = this.extractApiKeyFromHeader(request);

    if (!apiKey) {
      throw new UnauthorizedException('API key required');
    }

    try {
      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(apiKey, {
        secret: process.env.JWT_SECRET,
      });

      // Attach verifier info to request
      request['verifier'] = payload;
    } catch {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }

  private extractApiKeyFromHeader(request: any): string | undefined {
    const [type, key] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? key : undefined;
  }
}
