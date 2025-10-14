import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth(@Query('did') did: string) {
    // Guard redirects to GitHub - DID passed as state parameter
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req, @Res() res: Response) {
    const user = req.user;

    // Generate GitHub reputation credential
    const vcJws = await this.authService.issueGitHubCredential(user);

    // Redirect back to wallet with deep link
    const encodedVC = encodeURIComponent(vcJws);
    const deepLink = `veritas://credential?vc=${encodedVC}`;

    // Return HTML that redirects to deep link
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Veritas - Credential Issued</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 2rem;
              border-radius: 1rem;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 400px;
            }
            h1 { color: #333; margin-bottom: 1rem; }
            p { color: #666; margin-bottom: 1.5rem; }
            .button {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 0.75rem 2rem;
              border-radius: 0.5rem;
              text-decoration: none;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Credential Issued!</h1>
            <p>Your GitHub reputation has been verified and issued as a credential.</p>
            <a href="${deepLink}" class="button">Return to Wallet</a>
          </div>
          <script>
            // Auto-redirect after 2 seconds
            setTimeout(() => {
              window.location.href = '${deepLink}';
            }, 2000);
          </script>
        </body>
      </html>
    `);
  }
}
