import { ethers } from 'ethers';
import * as SecureStore from 'expo-secure-store';
import type { DID } from '@veritas/types';

const IDENTITY_KEY = 'veritas_identity_key';
const DID_KEY = 'veritas_did';

export class IdentityService {
  /**
   * Create a new decentralized identity
   * Generates a new key pair and stores it securely
   */
  static async createIdentity(): Promise<DID> {
    // Generate a new random wallet
    const wallet = ethers.Wallet.createRandom();

    // Store the private key in secure storage
    await SecureStore.setItemAsync(IDENTITY_KEY, wallet.privateKey);

    // Create a DID from the address
    const did: DID = {
      id: `did:ethr:polygon:${wallet.address}`,
      publicKey: wallet.publicKey,
    };

    // Store the DID for quick access
    await SecureStore.setItemAsync(DID_KEY, JSON.stringify(did));

    return did;
  }

  /**
   * Get the existing identity
   * Returns null if no identity exists
   */
  static async getIdentity(): Promise<DID | null> {
    try {
      const didJson = await SecureStore.getItemAsync(DID_KEY);

      if (!didJson) {
        return null;
      }

      return JSON.parse(didJson);
    } catch (error) {
      console.error('Error retrieving identity:', error);
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
   * Get the wallet instance for signing
   * Used internally for credential operations
   */
  static async getWallet(): Promise<ethers.Wallet | null> {
    try {
      const privateKey = await SecureStore.getItemAsync(IDENTITY_KEY);

      if (!privateKey) {
        return null;
      }

      return new ethers.Wallet(privateKey);
    } catch (error) {
      console.error('Error retrieving wallet:', error);
      return null;
    }
  }

  /**
   * Delete the identity (for development/testing)
   * WARNING: This is irreversible!
   */
  static async deleteIdentity(): Promise<void> {
    await SecureStore.deleteItemAsync(IDENTITY_KEY);
    await SecureStore.deleteItemAsync(DID_KEY);
  }
}
