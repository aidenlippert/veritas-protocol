import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3001/auth/github/callback',
      scope: ['user:email', 'read:user'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const { id, username, displayName, emails, profileUrl, _json } = profile;

    const user = {
      githubId: id,
      username,
      displayName: displayName || username,
      email: emails?.[0]?.value,
      profileUrl,
      avatarUrl: _json.avatar_url,
      bio: _json.bio,
      company: _json.company,
      location: _json.location,
      publicRepos: _json.public_repos,
      followers: _json.followers,
      following: _json.following,
      createdAt: _json.created_at,
      accessToken,
      // Extract the DID from state parameter
      did: req.query.state,
    };

    return user;
  }
}
