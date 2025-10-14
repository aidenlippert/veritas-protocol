# 🚀 Quick Deploy - Complete Stack

## Your Deployment Checklist

### ✅ Step 1: Railway (API) - 5 minutes

1. Go to https://railway.app
2. Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `aidenlippert/veritas-protocol`
5. **Root Directory**: `apps/api`
6. Add environment variables (see below)
7. Click Deploy

**Your API URL**: `https://your-api.up.railway.app`

---

### ✅ Step 2: Vercel (Verifier Portal) - 2 minutes

1. Go to https://vercel.com/new
2. Import `aidenlippert/veritas-protocol`
3. **Root Directory**: `apps/verifier-portal`
4. **Environment Variable**:
   - `NEXT_PUBLIC_API_URL` = Your Railway API URL
5. Click Deploy

**Your Portal URL**: `https://your-portal.vercel.app`

---

### ✅ Step 3: Vercel (Verifier Web) - 2 minutes

1. Create another Vercel project
2. Import same repository
3. **Root Directory**: `apps/verifier-web`
4. **No environment variables needed**
5. Click Deploy

**Your Verifier URL**: `https://your-verifier.vercel.app`

---

## Railway Environment Variables

Copy and paste these into Railway:

```bash
NODE_ENV=production
PORT=${{PORT}}
ISSUER_PRIVATE_KEY=0x0123456789012345678901234567890123456789012345678901234567890123
DEPLOYER_PRIVATE_KEY=638f5c2eec0f0de6da5903bc639c86770dc80420ef7f601c04ae2bc9640232bf
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
POLYGON_MAINNET_RPC_URL=https://polygon-rpc.com
POLYGONSCAN_API_KEY=SJIYXJ2JZRI4M9EEBMQXJQ3NSPSETQDSHI
REVOCATION_REGISTRY_ADDRESS=0x2EDFa4367b8A28Ec8C2009DB0Ef06BDfb051480d
JWT_SECRET=c3f9a2b8e1d4f7a6c9b2e5d8f1a4b7c0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
ISSUER_DID=did:ethr:polygon:0xF5d669627376EBd411E34800bE0b5963A538Fd79
ALLOWED_ORIGINS=
```

**After Vercel deployment**, update:
- `ALLOWED_ORIGINS`: Add your Vercel URLs
- `GITHUB_CALLBACK_URL`: Add your Railway URL + `/auth/github/callback`

---

## Post-Deployment

### 1. Update CORS (Railway)

After Vercel gives you URLs, go back to Railway and update:

```bash
ALLOWED_ORIGINS=https://your-portal.vercel.app,https://your-verifier.vercel.app,veritas://
```

Redeploy Railway.

### 2. Setup GitHub OAuth (Optional)

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. **Callback URL**: `https://your-api.up.railway.app/auth/github/callback`
4. Get Client ID and Secret
5. Add to Railway environment variables
6. Redeploy

### 3. Test Everything

**API Health Check**:
```bash
curl https://your-api.up.railway.app
```

**Create Verifier Account**:
Go to your Portal URL, sign up, get API key

**Verify Credential**:
Go to your Verifier Web URL, scan a QR code

---

## Your Live URLs

After deployment, you'll have:

- 🌐 **API**: `https://veritas-api.up.railway.app`
- 🖥️ **Portal**: `https://veritas-portal.vercel.app`
- 📱 **Verifier**: `https://veritas-verifier.vercel.app`
- ⛓️ **Contract**: `0x2EDFa4367b8A28Ec8C2009DB0Ef06BDfb051480d` (Polygon Amoy)

---

## Need Help?

- Railway: `RAILWAY_DEPLOYMENT.md`
- Vercel: `VERCEL_DEPLOYMENT.md`
- Full guide: `DEPLOYMENT.md`
