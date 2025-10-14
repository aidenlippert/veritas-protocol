# Veritas Protocol - Quick Start Guide

Get the protocol running in 5 minutes.

## Prerequisites

```bash
node --version  # Should be >= 18
npm --version   # Should be >= 9
```

## Step 1: Install Dependencies

```bash
npm install
```

This installs all dependencies for the entire monorepo (~1-2 minutes).

## Step 2: Build All Packages

```bash
npm run build
```

Builds all packages in dependency order (~10 seconds).

## Step 3: Run Smart Contract Tests

```bash
cd packages/contracts
npm test
```

Expected output:
```
StatusList2021Registry
  ✔ should allow issuer to revoke a credential
  ✔ should allow issuer to un-revoke a credential
  ...
  8 passing (811ms)
```

## Step 4: Start the API (Local)

```bash
cd ../../apps/api
npm run start:dev
```

The API will start on [http://localhost:3000](http://localhost:3000)

**Note:** Uses development key by default. Check console for the issuer DID.

## Step 5: Test Credential Issuance

Create a test file `test-api.sh`:

```bash
curl -X POST http://localhost:3000/credentials/issue \
  -H "Content-Type: application/json" \
  -d '{
    "holderDID": "did:ethr:polygon:0x1234567890123456789012345678901234567890",
    "employer": "Test Company",
    "role": "Software Engineer",
    "startDate": "2023-01-01",
    "endDate": "2024-12-31"
  }'
```

Expected response:
```json
{
  "success": true,
  "credential": {
    "@context": [...],
    "id": "urn:uuid:...",
    "type": ["VerifiableCredential", "ProofOfEmploymentCredential"],
    "issuer": "did:ethr:polygon:0x...",
    "credentialSubject": {...},
    "proof": {...}
  }
}
```

## Step 6: Run the Mobile Wallet (Optional)

```bash
cd ../../apps/wallet
npm start
```

Options:
- Press `a` for Android emulator
- Press `i` for iOS simulator (Mac only)
- Press `w` for web
- Scan QR code with Expo Go app

## Deployment (Testnet)

### Get Testnet MATIC

1. Visit [Polygon Faucet](https://faucet.polygon.technology/)
2. Select "Amoy Testnet"
3. Enter your wallet address
4. Receive 0.1 MATIC

### Set Up Environment

```bash
# In root directory
cp .env.example .env
```

Edit `.env`:
```env
DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
```

### Deploy Contract

```bash
cd packages/contracts
npm run deploy:testnet
```

Copy the deployed contract address to `.env`:
```env
REVOCATION_REGISTRY_ADDRESS=0x...
```

## Common Commands

```bash
# Root directory
npm run build          # Build all packages
npm run dev            # Run all apps in dev mode
npm run lint           # Lint all packages
npm run check-types    # Type check all packages

# Contracts
cd packages/contracts
npm test               # Run tests
npm run deploy:testnet # Deploy to testnet
npx hardhat compile    # Compile contracts
npx hardhat node       # Start local node

# API
cd apps/api
npm run start:dev      # Development mode with hot reload
npm run build          # Production build
npm run start:prod     # Production mode

# Wallet
cd apps/wallet
npm start              # Start Expo dev server
npm run android        # Run on Android
npm run ios            # Run on iOS
npm run web            # Run in browser
```

## Troubleshooting

### Build Errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Hardhat Compilation Issues

```bash
cd packages/contracts
rm -rf cache artifacts typechain-types
npx hardhat clean
npx hardhat compile
```

### API Won't Start

Check that packages are built:
```bash
cd packages/types && npm run build
cd ../sdk-issuer && npm run build
cd ../../apps/api && npm run build
```

### Expo/Wallet Issues

```bash
cd apps/wallet
rm -rf .expo node_modules
npm install
npm start -- --clear
```

## Project Structure Reference

```
veritas-protocol/
├── apps/
│   ├── api/              # NestJS API
│   │   └── src/
│   │       └── credential/
│   │           ├── credential.controller.ts
│   │           ├── credential.service.ts
│   │           └── credential.module.ts
│   └── wallet/           # React Native Wallet
│       ├── screens/
│       │   ├── OnboardingScreen.tsx
│       │   └── HomeScreen.tsx
│       └── services/
│           └── IdentityService.ts
└── packages/
    ├── contracts/        # Solidity Contracts
    │   ├── contracts/
    │   │   └── StatusList2021Registry.sol
    │   ├── test/
    │   └── scripts/
    │       └── deploy.ts
    ├── sdk-issuer/       # Issuer SDK
    │   └── src/index.ts
    ├── sdk-verifier/     # Verifier SDK
    │   └── src/index.ts
    └── types/            # Shared Types
        └── src/index.ts
```

## Next Steps

1. ✅ Environment is set up
2. → Read [README.md](./README.md) for full documentation
3. → Read [SPRINT_0_COMPLETE.md](./SPRINT_0_COMPLETE.md) for architecture details
4. → Start Sprint 1: End-to-end credential flow

---

**Questions?** Review the main [README.md](./README.md) or check the inline code documentation.
