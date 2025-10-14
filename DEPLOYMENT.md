# Veritas Protocol Deployment Guide

## Prerequisites

1. **Environment Setup**
   - Create `.env` file in project root (see `.env.example`)
   - Fill in all required values:
     - `DEPLOYER_PRIVATE_KEY`: Private key for deployment wallet
     - `POLYGONSCAN_API_KEY`: API key from Polygonscan
     - `ISSUER_PRIVATE_KEY`: Private key for credential issuance
     - `JWT_SECRET`: Strong random secret for API authentication
     - `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`: OAuth credentials

2. **Testnet Funds**
   - Deployer address: `0x1AF3c73eB17f38bC645faE487942e57C5B9F4FE3`
   - Get testnet MATIC from:
     - [Polygon Faucet](https://faucet.polygon.technology/)
     - [Alchemy Amoy Faucet](https://www.alchemy.com/faucets/polygon-amoy)
   - Recommended: 1-2 MATIC for deployment and verification

## Deployment Steps

### 1. Deploy to Polygon Amoy Testnet

```bash
cd packages/contracts
npx hardhat run scripts/deploy.ts --network amoy
```

This will:
- Deploy StatusList2021Registry contract
- Display contract address
- Save deployment info to `deployments/amoy.json`
- Provide verification command

### 2. Verify Contract on Polygonscan

After deployment completes, verify the contract:

```bash
npx hardhat verify --network amoy <CONTRACT_ADDRESS>
```

Replace `<CONTRACT_ADDRESS>` with the deployed contract address from step 1.

### 3. Update Environment Variables

Add the deployed contract address to `.env`:

```bash
REVOCATION_REGISTRY_ADDRESS=<CONTRACT_ADDRESS>
```

### 4. Deploy $VERI Token (Optional)

```bash
npx hardhat run scripts/deploy-veri-token.ts --network amoy
```

Verify:

```bash
npx hardhat verify --network amoy <VERI_TOKEN_ADDRESS>
```

## Mainnet Deployment

⚠️ **IMPORTANT: Only deploy to mainnet after thorough testing on testnet**

### 1. Final Security Checks

- Review Slither report: `packages/contracts/slither-report.txt`
- Ensure all tests pass: `npm test`
- Audit deployment wallet security
- Verify sufficient MATIC for deployment (minimum 1 MATIC recommended)

### 2. Deploy StatusList2021Registry

```bash
cd packages/contracts
npx hardhat run scripts/deploy-mainnet.ts --network polygon
```

### 3. Deploy $VERI Token

```bash
npx hardhat run scripts/deploy-veri-token.ts --network polygon
```

### 4. Verify Contracts

```bash
# StatusList2021Registry
npx hardhat verify --network polygon <REGISTRY_ADDRESS>

# VeriToken
npx hardhat verify --network polygon <VERI_TOKEN_ADDRESS>
```

### 5. Update Production Environment

Update production `.env` with mainnet contract addresses:

```bash
REVOCATION_REGISTRY_ADDRESS=<MAINNET_REGISTRY_ADDRESS>
VERI_TOKEN_ADDRESS=<MAINNET_VERI_ADDRESS>
```

## API Deployment

### 1. Build API

```bash
cd apps/api
npm run build
```

### 2. Set Production Environment Variables

Ensure all environment variables are set:
- `NODE_ENV=production`
- `PORT=3000` (or your preferred port)
- `ISSUER_PRIVATE_KEY`: Production issuer key
- `ISSUER_DID`: DID derived from issuer key
- `JWT_SECRET`: Strong production secret
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`: Production OAuth credentials
- `ALLOWED_ORIGINS`: Production frontend URLs

### 3. Start API

```bash
npm start
```

## Post-Deployment Verification

### Contract Verification

1. Visit Polygonscan:
   - Testnet: https://amoy.polygonscan.com/address/<ADDRESS>
   - Mainnet: https://polygonscan.com/address/<ADDRESS>

2. Verify contract is verified (green checkmark)
3. Test contract read/write functions

### API Health Check

```bash
curl http://localhost:3000
```

Should return: `"Hello World!"`

### Verifier Account Test

```bash
# Create verifier account
curl -X POST http://localhost:3000/verifier/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword"}'

# Response contains API key - save it!
```

### GitHub OAuth Test

1. Register OAuth app at: https://github.com/settings/developers
2. Set callback URL: `http://localhost:3000/auth/github/callback`
3. Add credentials to `.env`
4. Test flow: Visit `http://localhost:3000/auth/github?did=did:ethr:polygon:0x123...`

## Troubleshooting

### Insufficient Funds Error

```
Error: insufficient funds for gas * price + value
```

**Solution**: Add more MATIC to deployer wallet

### Verification Failed

```
Error: Contract source code not verified
```

**Solution**: Ensure Polygonscan API key is correct and contract was compiled with same settings

### API Build Errors

**Solution**: Run `npm install` in all workspace packages and rebuild

## Security Reminders

- ✅ Never commit `.env` file
- ✅ Use dedicated deployment wallet (not personal wallet)
- ✅ Rotate API keys after testing
- ✅ Enable rate limiting in production
- ✅ Use HTTPS in production
- ✅ Monitor contract activity on Polygonscan
- ✅ Set up alerts for unusual activity
