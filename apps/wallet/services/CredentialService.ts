import * as SecureStore from 'expo-secure-store';
import type { VerifiableCredential } from '@veritas/types';

const CREDENTIALS_KEY = 'veritas_credentials';

export interface StoredCredential {
  id: string;
  vc: VerifiableCredential;
  receivedAt: string;
}

export class CredentialService {
  /**
   * Save a new credential to secure storage
   */
  static async saveCredential(vcJws: string): Promise<void> {
    try {
      // Parse the JWS to extract the credential
      const vc = await this.parseCredentialFromJWS(vcJws);

      // Get existing credentials
      const credentials = await this.getAllCredentials();

      // Check for duplicates
      const isDuplicate = credentials.some(cred => cred.id === vc.id);
      if (isDuplicate) {
        throw new Error('Credential already exists');
      }

      // Add new credential
      const newCredential: StoredCredential = {
        id: vc.id,
        vc,
        receivedAt: new Date().toISOString(),
      };

      credentials.push(newCredential);

      // Save back to secure storage
      await SecureStore.setItemAsync(
        CREDENTIALS_KEY,
        JSON.stringify(credentials)
      );
    } catch (error) {
      console.error('Error saving credential:', error);
      throw error;
    }
  }

  /**
   * Get all stored credentials
   */
  static async getAllCredentials(): Promise<StoredCredential[]> {
    try {
      const credentialsJson = await SecureStore.getItemAsync(CREDENTIALS_KEY);

      if (!credentialsJson) {
        return [];
      }

      return JSON.parse(credentialsJson);
    } catch (error) {
      console.error('Error retrieving credentials:', error);
      return [];
    }
  }

  /**
   * Get a single credential by ID
   */
  static async getCredentialById(id: string): Promise<StoredCredential | null> {
    const credentials = await this.getAllCredentials();
    return credentials.find(cred => cred.id === id) || null;
  }

  /**
   * Delete a credential
   */
  static async deleteCredential(id: string): Promise<void> {
    try {
      const credentials = await this.getAllCredentials();
      const filtered = credentials.filter(cred => cred.id !== id);

      await SecureStore.setItemAsync(
        CREDENTIALS_KEY,
        JSON.stringify(filtered)
      );
    } catch (error) {
      console.error('Error deleting credential:', error);
      throw error;
    }
  }

  /**
   * Parse a credential from JWS format
   * For MVP, we'll do basic parsing. In production, use a proper JWS library.
   */
  private static async parseCredentialFromJWS(
    vcJws: string
  ): Promise<VerifiableCredential> {
    try {
      // The JWS format from our issuer is: base64(header).base64(payload).signature
      // For now, we'll parse it directly since we control the format

      // Check if it looks like a full VC object (fallback for direct API responses)
      if (vcJws.startsWith('{')) {
        return JSON.parse(vcJws);
      }

      // Otherwise, treat it as JWS and extract from the proof
      const vc = JSON.parse(vcJws) as VerifiableCredential;

      if (!vc.id || !vc.type || !vc.credentialSubject) {
        throw new Error('Invalid credential format');
      }

      return vc;
    } catch (error) {
      console.error('Error parsing credential:', error);
      throw new Error('Invalid credential format');
    }
  }

  /**
   * Clear all credentials (for development/testing)
   */
  static async clearAllCredentials(): Promise<void> {
    await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
  }
}
