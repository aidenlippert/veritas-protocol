# Vercel Deployment Guide

This guide covers deploying the Veritas Protocol web applications to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional): `npm install -g vercel`
3. **GitHub Repository**: Push your code to GitHub (recommended for auto-deployments)

## Apps to Deploy

### 1. Verifier Portal (`apps/verifier-portal`)
The customer-facing dashboard for verifiers to manage API keys and $VERI balance.

**Recommended URL**: `verifier-portal.vercel.app` or custom domain

### 2. Verifier Web App (`apps/verifier-web`)
The QR code scanner application for credential verification.

**Recommended URL**: `verifier-web.vercel.app` or custom domain

## Deployment Steps

### Option A: Deploy via Vercel Dashboard (Recommended)

#### 1. Import Projects

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will detect the monorepo structure

#### 2. Configure Verifier Portal

**Project Settings:**
- **Framework Preset**: Next.js
- **Root Directory**: `apps/verifier-portal`
- **Build Command**: `cd ../.. && npm run build --filter=verifier-portal`
- **Output Directory**: `apps/verifier-portal/.next`
- **Install Command**: `npm install`

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

#### 3. Configure Verifier Web

**Project Settings:**
- **Framework Preset**: Next.js
- **Root Directory**: `apps/verifier-web`
- **Build Command**: `cd ../.. && npm run build --filter=verifier-web`
- **Output Directory**: `apps/verifier-web/.next`
- **Install Command**: `npm install`

**No environment variables needed** (uses client-side only)

### Option B: Deploy via Vercel CLI

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login to Vercel

```bash
vercel login
```

#### 3. Deploy Verifier Portal

```bash
cd apps/verifier-portal
vercel --prod
```

Follow prompts and set environment variables when asked.

#### 4. Deploy Verifier Web

```bash
cd apps/verifier-web
vercel --prod
```

## Environment Variables

### Verifier Portal

Required environment variables in Vercel dashboard:

```
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

**Important**: Update this to point to your deployed API (Railway, Render, or your own server).

### Verifier Web

No environment variables required - all verification happens client-side.

## Post-Deployment Configuration

### 1. Update API CORS Settings

Add your Vercel deployment URLs to the API's allowed origins in `.env`:

```bash
ALLOWED_ORIGINS=https://verifier-portal.vercel.app,https://verifier-web.vercel.app,veritas://
```

Then redeploy your API.

### 2. Test the Deployments

**Verifier Portal:**
1. Visit your deployed URL
2. Sign up for an account
3. Verify you receive an API key
4. Check balance display works

**Verifier Web:**
1. Visit your deployed URL
2. Click "Start Scanning"
3. Grant camera permissions
4. Test with a QR code from the wallet app

### 3. Update Wallet Configuration

Update the wallet's API URL to point to your production API:

In `apps/wallet/components/Web2BridgeCard.tsx`, update:
```typescript
const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://your-production-api.com';
```

## Automatic Deployments

### Enable Auto-Deploy from GitHub

1. In Vercel dashboard, go to project settings
2. Under "Git", enable automatic deployments
3. Choose production branch (usually `main`)
4. Every push to `main` will trigger a new deployment

### Preview Deployments

Vercel automatically creates preview deployments for:
- Pull requests
- Non-production branches

Each PR gets a unique URL for testing.

## Custom Domains

### Add Custom Domain

1. Go to project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain (e.g., `verify.veritas.id`)
4. Update DNS records as instructed
5. Vercel automatically provisions SSL certificate

### Recommended Domain Structure

```
portal.veritas.id     → Verifier Portal
verify.veritas.id     → Verifier Web
api.veritas.id        → API (deploy separately)
```

## Monorepo Build Optimization

### Speed Up Builds

Create `turbo.json` in monorepo root if not exists:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    }
  }
}
```

### Shared Packages

Vercel will automatically build shared packages (`@veritas/types`, `@veritas/sdk-verifier`, etc.) as dependencies.

## Troubleshooting

### Build Failures

**Error**: `Cannot find module '@veritas/types'`

**Solution**: Ensure build command includes workspace installation:
```bash
cd ../.. && npm install && npm run build --filter=verifier-portal
```

### Environment Variable Issues

**Error**: API calls fail with CORS errors

**Solution**:
1. Check `NEXT_PUBLIC_API_URL` is set in Vercel environment variables
2. Verify API has correct CORS origins configured
3. Redeploy after changing environment variables

### React Version Conflicts

**Error**: React version mismatch warnings

**Solution**: This is a known issue with the monorepo. Apps build successfully - warnings can be ignored.

## Performance Optimization

### Enable Analytics

1. Go to project settings in Vercel
2. Enable "Analytics" tab
3. Monitor Core Web Vitals

### Configure Caching

Vercel automatically caches:
- Static assets (images, fonts)
- Build outputs
- API responses (with proper headers)

No additional configuration needed.

## Security Best Practices

### 1. Environment Variables

- Never commit `.env` files
- Use Vercel's encrypted environment variables
- Rotate API keys regularly

### 2. Content Security Policy

Add to `next.config.js`:

```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### 3. Rate Limiting

Vercel provides DDoS protection automatically. For additional rate limiting, use Vercel Edge Middleware.

## Monitoring & Logs

### View Deployment Logs

1. Go to deployments tab in Vercel dashboard
2. Click on any deployment
3. View build logs and runtime logs

### Set Up Alerts

1. Enable Vercel notifications
2. Get alerts for:
   - Failed deployments
   - High error rates
   - Performance degradation

## Cost Optimization

### Free Tier Limits

Vercel Free tier includes:
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic SSL
- Preview deployments

### Pro Tier ($20/month)

Consider Pro tier for:
- Custom domains
- Team collaboration
- Priority support
- Advanced analytics

## Next Steps

After successful deployment:

1. ✅ Test all functionality on live URLs
2. ✅ Update documentation with live URLs
3. ✅ Configure custom domains
4. ✅ Set up monitoring and alerts
5. ✅ Enable auto-deployments from GitHub
6. ✅ Share links with beta testers

## Support

- Vercel Documentation: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord
- GitHub Issues: Report bugs in your repository
