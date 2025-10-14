# Veritas Protocol

**The trust layer for the digital economy.**

A decentralized professional reputation network built on W3C standards for Decentralized Identifiers (DIDs) and Verifiable Credentials (VCs).

## 🏗️ Architecture

This is a **Turborepo monorepo** containing all components of the Veritas Protocol:

### Apps
- **[apps/api](./apps/api)** - NestJS API for credential issuance
- **[apps/wallet](./apps/wallet)** - React Native (Expo) mobile wallet

### Packages
- **[packages/contracts](./packages/contracts)** - Solidity smart contracts (Polygon)
- **[packages/types](./packages/types)** - Shared TypeScript types
- **[packages/sdk-issuer](./packages/sdk-issuer)** - SDK for issuing credentials
- **[packages/sdk-verifier](./packages/sdk-verifier)** - SDK for verifying credentials

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 9

### Installation

```bash
# Install all dependencies
npm install

# Build all packages
npm run build
```

### Running in Development

```bash
# Run all apps in dev mode
npm run dev
```

## 📦 Package Scripts

Each package has the following scripts:

```bash
# Build
npm run build

# Development mode (with watch)
npm run dev

# Type checking
npm run check-types

# Linting
npm run lint
```

## 🧪 Sprint 0 Status ✅

**Sprint Goal: Establish professional monorepo with complete dev environment**

All tasks completed:

- ✅ Turborepo monorepo initialized
- ✅ Hardhat configured for smart contracts
- ✅ NestJS API application set up
- ✅ React Native wallet with Expo configured
- ✅ All core dependencies installed
- ✅ TypeScript and build tooling configured
- ✅ .gitignore and environment configuration created
- ✅ "Hello world" compilation verified for all packages

### Test Results

**Smart Contracts:**
```
StatusList2021Registry
  ✔ All 8 tests passing (811ms)
```

**SDK Packages:**
- ✅ @veritas/types builds successfully
- ✅ @veritas/sdk-issuer builds successfully
- ✅ @veritas/sdk-verifier builds successfully

**Applications:**
- ✅ API builds successfully
- ✅ Wallet configured and ready

## 🔧 Configuration

### Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Fill in the required values:
```env
# Generate a random private key for the issuer
ISSUER_PRIVATE_KEY=0x...

# Get a free RPC URL from Alchemy or Infura
POLYGON_AMOY_RPC_URL=https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY

# For deployment
DEPLOYER_PRIVATE_KEY=0x...
```

### Deploy Smart Contracts

```bash
cd packages/contracts

# Deploy to Polygon Amoy testnet
npm run deploy:testnet
```

## 🏃‍♂️ Next Steps: Sprint 1

**Sprint Goal:** Complete identity lifecycle - create DID, issue credential, verify signature

Key deliverables:
1. Deploy RevocationRegistry to Amoy testnet
2. Identity creation in mobile wallet
3. Credential issuance API endpoint
4. End-to-end manual test

## 📚 Technology Stack

- **Blockchain:** Polygon (via Hardhat)
- **Smart Contracts:** Solidity ^0.8.20, OpenZeppelin
- **Backend:** NestJS, TypeScript
- **Mobile:** React Native, Expo
- **Identity:** W3C DIDs & VCs, ethers.js
- **Monorepo:** Turborepo
- **Testing:** Hardhat (contracts), Jest (API)

## 🔐 Security Notes

**For Development Only:**
- The API uses a hardcoded test key by default
- **NEVER** commit real private keys
- **NEVER** use development keys in production

## 📖 Standards Compliance

- [W3C DID v1.0](https://www.w3.org/TR/did-core/)
- [W3C Verifiable Credentials Data Model](https://www.w3.org/TR/vc-data-model/)
- [StatusList2021](https://w3c.github.io/vc-status-list-2021/)

## 📄 License

UNLICENSED - Proprietary

---

**Built with precision. Engineered for scale.**
