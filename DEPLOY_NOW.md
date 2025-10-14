# Quick Vercel Deployment Instructions

## 🚀 Deploy in 5 Minutes

### Step 1: Push to GitHub

```bash
cd /home/rocz/dawn/veritas-protocol
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Import to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `veritas-protocol` repository
4. Vercel will detect it's a monorepo

### Step 3: Deploy Verifier Portal

**Project Configuration:**
- **Project Name**: `veritas-verifier-portal` (or your choice)
- **Framework**: Next.js (auto-detected)
- **Root Directory**: `apps/verifier-portal`
- **Build Command**: Leave default or use `npm run build`
- **Output Directory**: `.next`

**Environment Variables:**
Click "Add Environment Variable":
- **Key**: `NEXT_PUBLIC_API_URL`
- **Value**: `http://localhost:3000` (update later with production API)

Click "Deploy" ✅

### Step 4: Deploy Verifier Web

Create another project:
- **Project Name**: `veritas-verifier-web`
- **Framework**: Next.js
- **Root Directory**: `apps/verifier-web`
- **Build Command**: Leave default
- **Output Directory**: `.next`
- **No environment variables needed**

Click "Deploy" ✅

### Step 5: Get Your URLs

After deployment completes, you'll get URLs like:
- Verifier Portal: `https://veritas-verifier-portal.vercel.app`
- Verifier Web: `https://veritas-verifier-web.vercel.app`

### Step 6: Update API URL

Once you have a production API deployed, update the Verifier Portal environment variable:

1. Go to Project Settings → Environment Variables
2. Update `NEXT_PUBLIC_API_URL` to your production API URL
3. Redeploy

## Alternative: One-Click Deploy

### Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy Verifier Portal
cd apps/verifier-portal
vercel --prod

# Deploy Verifier Web
cd ../verifier-web
vercel --prod
```

## What You'll Have

✅ **Verifier Portal**: Live customer dashboard for API key management
✅ **Verifier Web**: Live QR code scanner for credential verification
✅ **Auto HTTPS**: Vercel provides SSL certificates automatically
✅ **Global CDN**: Fast loading worldwide
✅ **Auto Deployments**: Every push to `main` triggers new deployment

## Next Steps

1. Share the Verifier Portal URL with beta users
2. Test credential verification flow end-to-end
3. Deploy API to production (Railway, Render, or your server)
4. Update environment variables with production URLs
5. Add custom domain (optional)

## Troubleshooting

**Build fails?**
- Check monorepo is correctly structured
- Ensure all dependencies are in package.json
- Verify no TypeScript errors locally

**Can't connect to API?**
- Check CORS settings in API
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Test API endpoint manually

## Support

Need help? Check:
- Full guide: `VERCEL_DEPLOYMENT.md`
- Vercel docs: https://vercel.com/docs
- Vercel support: https://vercel.com/support
