import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { HDKey } from '@scure/bip32';
import { sha256 } from '@noble/hashes/sha256';
import * as SecureStore from 'expo-secure-store';
import type { DID } from '@veritas/types';
import { ethers } from 'ethers';

const MNEMONIC_KEY = 'veritas_mnemonic';
const DID_KEY = 'veritas_did';
const PRIVATE_KEY = 'veritas_private_key';
const LINKED_ACCOUNTS_KEY = 'veritas_linked_accounts';

export type Chain = 'evm' | 'solana' | 'bitcoin';

export interface LinkedAccount {
  chain: Chain;
  address: string;
  signature: string;
  challenge: string;
  linkedAt: string;
}

export class IdentityService {
  /**
   * Generate a new 12-word BIP39 mnemonic
   */
  static generateMnemonic(): string {
    return bip39.generateMnemonic(wordlist, 128); // 128 bits = 12 words
  }

  /**
   * Validate a BIP39 mnemonic
   */
  static validateMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic, wordlist);
  }

  /**
   * Derive a did:key from a BIP39 mnemonic
   * Uses BIP32 derivation path: m/44'/60'/0'/0/0 (Ethereum standard)
   */
  private static deriveKeyFromMnemonic(mnemonic: string): { privateKey: Uint8Array; publicKey: Uint8Array } {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const hdkey = HDKey.fromMasterSeed(seed);

    // Derive using Ethereum's standard path
    const derived = hdkey.derive("m/44'/60'/0'/0/0");

    if (!derived.privateKey) {
      throw new Error('Failed to derive private key');
    }

    const privateKey = derived.privateKey;
    const publicKey = derived.publicKey!;

    return { privateKey, publicKey };
  }

  /**
   * Convert public key to did:key format
   * did:key uses multibase + multicodec encoding
   * For secp256k1: 0xe7 prefix + public key
   */
  private static publicKeyToDidKey(publicKey: Uint8Array): string {
    // Multicodec prefix for secp256k1-pub: 0xe7 0x01
    const multicodecPrefix = new Uint8Array([0xe7, 0x01]);
    const multicodecKey = new Uint8Array(multicodecPrefix.length + publicKey.length);
    multicodecKey.set(multicodecPrefix);
    multicodecKey.set(publicKey, multicodecPrefix.length);

    // Base58btc encoding (multibase 'z' prefix)
    const base58 = this.base58Encode(multicodecKey);
    return `did:key:z${base58}`;
  }

  /**
   * Simple base58 encoding (Bitcoin alphabet)
   */
  private static base58Encode(bytes: Uint8Array): string {
    const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let num = BigInt('0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''));

    if (num === 0n) return ALPHABET[0];

    let result = '';
    while (num > 0n) {
      const remainder = Number(num % 64n);
      result = ALPHABET[remainder] + result;
      num = num / 64n;
    }

    // Add leading zeros
    for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
      result = ALPHABET[0] + result;
    }

    return result;
  }

  /**
   * Create a new decentralized identity from a mnemonic
   * If no mnemonic is provided, generates a new one
   */
  static async createIdentity(mnemonic?: string): Promise<{ did: DID; mnemonic: string }> {
    const seed = mnemonic || this.generateMnemonic();

    if (!this.validateMnemonic(seed)) {
      throw new Error('Invalid mnemonic phrase');
    }

    const { privateKey, publicKey } = this.deriveKeyFromMnemonic(seed);

    // Create did:key
    const didId = this.publicKeyToDidKey(publicKey);

    const did: DID = {
      id: didId,
      publicKey: Buffer.from(publicKey).toString('hex'),
    };

    // Store securely
    await SecureStore.setItemAsync(MNEMONIC_KEY, seed);
    await SecureStore.setItemAsync(PRIVATE_KEY, Buffer.from(privateKey).toString('hex'));
    await SecureStore.setItemAsync(DID_KEY, JSON.stringify(did));

    return { did, mnemonic: seed };
  }

  /**
   * Restore identity from mnemonic
   */
  static async restoreFromMnemonic(mnemonic: string): Promise<DID> {
    const { did } = await this.createIdentity(mnemonic);
    return did;
  }

  /**
   * Get the existing identity
   */
  static async getIdentity(): Promise<DID | null> {
    try {
      const didJson = await SecureStore.getItemAsync(DID_KEY);
      if (!didJson) return null;
      return JSON.parse(didJson);
    } catch (error) {
      console.error('Error retrieving identity:', error);
      return null;
    }
  }

  /**
   * Get the stored mnemonic (for backup purposes)
   * WARNING: Only use this for secure backup flows!
   */
  static async getMnemonic(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(MNEMONIC_KEY);
    } catch (error) {
      console.error('Error retrieving mnemonic:', error);
      return null;
    }
  }

  /**
   * Check if an identity exists
   */
  static async hasIdentity(): Promise<boolean> {
    const identity = await this.getIdentity();
    return identity !== null;
  }

  /**
   * Get private key for signing
   */
  static async getPrivateKey(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(PRIVATE_KEY);
    } catch (error) {
      console.error('Error retrieving private key:', error);
      return null;
    }
  }

  /**
   * Sign a message with the identity's private key
   */
  static async signMessage(message: string): Promise<string> {
    const privateKeyHex = await this.getPrivateKey();
    if (!privateKeyHex) {
      throw new Error('No identity found');
    }

    const privateKey = Buffer.from(privateKeyHex, 'hex');
    const messageHash = sha256(Buffer.from(message, 'utf-8'));

    // For now, return hex signature (will implement proper ECDSA later)
    return Buffer.from(messageHash).toString('hex');
  }

  /**
   * Delete the identity
   * WARNING: This is irreversible without the backup mnemonic!
   */
  static async deleteIdentity(): Promise<void> {
    await SecureStore.deleteItemAsync(MNEMONIC_KEY);
    await SecureStore.deleteItemAsync(PRIVATE_KEY);
    await SecureStore.deleteItemAsync(DID_KEY);
    await SecureStore.deleteItemAsync(LINKED_ACCOUNTS_KEY);
  }

  // ============================================================================
  // WALLET LINKING METHODS
  // ============================================================================

  /**
   * Generate a unique challenge message for wallet linking
   * This message will be signed by the wallet to prove ownership
   */
  static async generateLinkChallenge(chain: Chain): Promise<string> {
    const did = await this.getIdentity();
    if (!did) {
      throw new Error('No identity found. Create an identity first.');
    }

    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(2, 15);

    const challenge = `I am proving ownership of this ${chain.toUpperCase()} wallet to my Veritas Identity.\n\nDID: ${did.id}\nChain: ${chain}\nTimestamp: ${timestamp}\nNonce: ${nonce}`;

    return challenge;
  }

  /**
   * Verify a signature proving wallet ownership
   * Returns true if the signature is valid for the given challenge and address
   */
  static async verifyLinkSignature(params: {
    originalMessage: string;
    signature: string;
    address: string;
    chain: Chain;
  }): Promise<boolean> {
    const { originalMessage, signature, address, chain } = params;

    try {
      switch (chain) {
        case 'evm':
          return this.verifyEVMSignature(originalMessage, signature, address);

        case 'solana':
          // TODO: Implement Solana signature verification
          throw new Error('Solana verification not yet implemented');

        case 'bitcoin':
          // TODO: Implement Bitcoin signature verification
          throw new Error('Bitcoin verification not yet implemented');

        default:
          throw new Error(`Unsupported chain: ${chain}`);
      }
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Verify an EVM wallet signature (Ethereum, Polygon, BSC, etc.)
   * Uses personal_sign standard (EIP-191)
   */
  private static async verifyEVMSignature(
    message: string,
    signature: string,
    expectedAddress: string
  ): Promise<boolean> {
    try {
      // Recover the address from the signature
      const recoveredAddress = ethers.verifyMessage(message, signature);

      // Compare addresses (case-insensitive)
      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
      console.error('EVM signature verification error:', error);
      return false;
    }
  }

  /**
   * Get all linked accounts
   */
  static async getLinkedAccounts(): Promise<LinkedAccount[]> {
    try {
      const accountsJson = await SecureStore.getItemAsync(LINKED_ACCOUNTS_KEY);
      if (!accountsJson) return [];
      return JSON.parse(accountsJson);
    } catch (error) {
      console.error('Error retrieving linked accounts:', error);
      return [];
    }
  }

  /**
   * Add a new linked account
   */
  static async addLinkedAccount(account: LinkedAccount): Promise<void> {
    try {
      const accounts = await this.getLinkedAccounts();

      // Check if this account is already linked
      const existingIndex = accounts.findIndex(
        (a) => a.chain === account.chain && a.address.toLowerCase() === account.address.toLowerCase()
      );

      if (existingIndex >= 0) {
        // Update existing account
        accounts[existingIndex] = account;
      } else {
        // Add new account
        accounts.push(account);
      }

      await SecureStore.setItemAsync(LINKED_ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch (error) {
      console.error('Error adding linked account:', error);
      throw error;
    }
  }

  /**
   * Remove a linked account
   */
  static async removeLinkedAccount(chain: Chain, address: string): Promise<void> {
    try {
      const accounts = await this.getLinkedAccounts();
      const filtered = accounts.filter(
        (a) => !(a.chain === chain && a.address.toLowerCase() === address.toLowerCase())
      );
      await SecureStore.setItemAsync(LINKED_ACCOUNTS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing linked account:', error);
      throw error;
    }
  }

  /**
   * Check if a specific wallet is linked
   */
  static async isWalletLinked(chain: Chain, address: string): Promise<boolean> {
    const accounts = await this.getLinkedAccounts();
    return accounts.some(
      (a) => a.chain === chain && a.address.toLowerCase() === address.toLowerCase()
    );
  }
}
