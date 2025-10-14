# Railway API Deployment Guide

## 🚂 Deploy NestJS API to Railway in 5 Minutes

### Step 1: Sign Up for Railway

1. Go to https://railway.app
2. Click "Login with GitHub"
3. Authorize Railway to access your repositories
4. You get **$5 free credit** (plenty for testing)

### Step 2: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `aidenlippert/veritas-protocol`
4. Railway will detect the monorepo

### Step 3: Configure the Service

**Root Directory:**
```
apps/api
```

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm run start:prod
```

Railway will auto-detect these from your package.json, but you can verify in Settings.

### Step 4: Add Environment Variables

Click on "Variables" tab and add these **EXACT** variables:

```bash
# Node Environment
NODE_ENV=production

# API Port (Railway provides this automatically)
PORT=${{PORT}}

# Issuer Private Key (from your .env file)
ISSUER_PRIVATE_KEY=0x0123456789012345678901234567890123456789012345678901234567890123

# Deployer Private Key (for contract interactions)
DEPLOYER_PRIVATE_KEY=638f5c2eec0f0de6da5903bc639c86770dc80420ef7f601c04ae2bc9640232bf

# Polygon RPC URLs
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
POLYGON_MAINNET_RPC_URL=https://polygon-rpc.com

# Polygonscan API Key
POLYGONSCAN_API_KEY=SJIYXJ2JZRI4M9EEBMQXJQ3NSPSETQDSHI

# Deployed Contract Address
REVOCATION_REGISTRY_ADDRESS=0x2EDFa4367b8A28Ec8C2009DB0Ef06BDfb051480d

# JWT Secret (generate a strong one)
JWT_SECRET=c3f9a2b8e1d4f7a6c9b2e5d8f1a4b7c0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8

# GitHub OAuth (get from GitHub Developer Settings)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=https://your-api.up.railway.app/auth/github/callback

# Issuer DID (generate from issuer private key)
ISSUER_DID=did:ethr:polygon:0xYOUR_ISSUER_ADDRESS

# CORS Origins (add your Vercel URLs after deployment)
ALLOWED_ORIGINS=https://your-portal.vercel.app,https://your-verifier-web.vercel.app,veritas://
```

### Step 5: Deploy

1. Click "Deploy"
2. Railway will build and deploy automatically
3. Wait 2-3 minutes for deployment to complete
4. You'll get a URL like: `https://your-api.up.railway.app`

### Step 6: Set Up Custom Domain (Optional)

1. Go to "Settings" → "Domains"
2. Click "Generate Domain" for a Railway subdomain
3. Or add your custom domain (e.g., `api.veritas.id`)

### Step 7: Update GitHub OAuth Callback

1. Go to https://github.com/settings/developers
2. Click "New OAuth App" or edit existing
3. Set **Authorization callback URL** to:
   ```
   https://your-api.up.railway.app/auth/github/callback
   ```
4. Copy Client ID and Secret
5. Update Railway environment variables with these values
6. Redeploy

### Step 8: Update CORS Origins

After you deploy Vercel apps, update the `ALLOWED_ORIGINS` variable in Railway:

```bash
ALLOWED_ORIGINS=https://your-portal.vercel.app,https://your-verifier-web.vercel.app,veritas://
```

Then redeploy.

### Step 9: Test Your API

Visit your Railway URL:
```
https://your-api.up.railway.app
```

You should see: `"Hello World!"`

Test the health endpoint:
```bash
curl https://your-api.up.railway.app
```

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | `production` |
| `PORT` | Server port | `${{PORT}}` (Railway provides this) |
| `ISSUER_PRIVATE_KEY` | Private key for issuing credentials | `0x123...` |
| `DEPLOYER_PRIVATE_KEY` | Private key for contract deployment | `0x638...` |
| `JWT_SECRET` | Secret for API key generation | Long random string |
| `REVOCATION_REGISTRY_ADDRESS` | Deployed contract address | `0x2EDFa...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | None (OAuth won't work) |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | None (OAuth won't work) |
| `GITHUB_CALLBACK_URL` | OAuth callback URL | `http://localhost:3000/...` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3001,...` |

## Troubleshooting

### Build Fails

**Error**: `Cannot find module '@veritas/types'`

**Solution**: Railway needs to install workspace dependencies. Update build command:
```bash
cd ../.. && npm install && cd apps/api && npm run build
```

### App Crashes After Deploy

**Error**: `ENOENT: no such file or directory`

**Solution**: Check that start command is correct:
```bash
npm run start:prod
```

### CORS Errors

**Error**: `Access-Control-Allow-Origin header`

**Solution**: Update `ALLOWED_ORIGINS` to include your frontend URLs.

### GitHub OAuth Not Working

**Error**: `redirect_uri_mismatch`

**Solution**:
1. Update GitHub OAuth app callback URL
2. Update `GITHUB_CALLBACK_URL` in Railway
3. Redeploy

## Monitoring & Logs

### View Logs

1. Go to Railway dashboard
2. Click on your service
3. Click "Deployments"
4. Click on active deployment
5. View real-time logs

### Monitor Usage

Railway dashboard shows:
- CPU usage
- Memory usage
- Network traffic
- Build time
- Deployment status

### Set Up Alerts

1. Go to project settings
2. Enable notifications for:
   - Failed deployments
   - High resource usage
   - Service crashes

## Auto-Deployment

Railway automatically deploys on every push to `main`:

```bash
git add .
git commit -m "Update API"
git push origin main
```

Railway will detect changes and redeploy automatically.

## Cost Optimization

### Free Tier ($5 credit/month)

Estimated usage:
- **Hobby API**: ~$2-3/month (500MB RAM, minimal traffic)
- **Production API**: ~$5-10/month (1GB RAM, moderate traffic)

### Tips to Save Credits

1. **Sleep unused services**: Railway can sleep services after inactivity
2. **Optimize memory**: Reduce memory usage to lower costs
3. **Use caching**: Implement Redis caching to reduce compute

## Scaling

### Vertical Scaling

Increase resources in Railway dashboard:
- Memory: 512MB → 1GB → 2GB
- CPU: Shared → Dedicated

### Horizontal Scaling

Railway doesn't support horizontal scaling on free tier. For high traffic:
- Upgrade to Pro plan ($20/month)
- Enable auto-scaling
- Add load balancer

## Alternative: Render Deployment

If you prefer Render over Railway:

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Settings:
   - **Root Directory**: `apps/api`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Environment**: Node
5. Add same environment variables as Railway
6. Deploy

**Render Pros**: 750 free hours/month
**Render Cons**: Slower cold starts, more configuration

## Next Steps

After Railway deployment:

1. ✅ Copy your Railway URL (e.g., `https://veritas-api.up.railway.app`)
2. ✅ Update Vercel environment variables:
   - `NEXT_PUBLIC_API_URL` = Your Railway URL
3. ✅ Redeploy Vercel apps
4. ✅ Test end-to-end flow
5. ✅ Set up custom domain (optional)
6. ✅ Configure monitoring and alerts

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: Report bugs in your repository
