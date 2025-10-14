import { ethers } from "ethers";
import type { VerifiableCredential } from "@veritas/types";

export interface VerificationResult {
  verified: boolean;
  issuer?: string;
  subject?: any;
  errors?: string[];
}

export interface VerifyCredentialOptions {
  credential: VerifiableCredential;
  revocationRegistryAddress?: string;
  provider?: ethers.Provider;
}

/**
 * Verify a Verifiable Credential
 * @param options Configuration for verification
 * @returns Verification result with credential data or errors
 */
export async function verifyCredential(
  options: VerifyCredentialOptions
): Promise<VerificationResult> {
  const { credential, revocationRegistryAddress, provider } = options;
  const errors: string[] = [];

  try {
    // Step 1: Validate structure
    if (!credential["@context"] || !credential.type || !credential.issuer) {
      errors.push("Invalid credential structure");
      return { verified: false, errors };
    }

    // Step 2: Check expiration
    if (credential.expirationDate) {
      const expirationDate = new Date(credential.expirationDate);
      if (expirationDate < new Date()) {
        errors.push("Credential has expired");
        return { verified: false, errors };
      }
    }

    // Step 3: Verify the cryptographic signature
    const isSignatureValid = await verifySignature(credential);
    if (!isSignatureValid) {
      errors.push("Invalid signature");
      return { verified: false, errors };
    }

    // Step 4: Check revocation status (if registry provided)
    if (revocationRegistryAddress && provider) {
      const isRevoked = await checkRevocationStatus(
        credential,
        revocationRegistryAddress,
        provider
      );
      if (isRevoked) {
        errors.push("Credential has been revoked");
        return { verified: false, errors };
      }
    }

    // All checks passed
    return {
      verified: true,
      issuer: credential.issuer,
      subject: credential.credentialSubject,
    };
  } catch (error) {
    errors.push(`Verification error: ${error instanceof Error ? error.message : String(error)}`);
    return { verified: false, errors };
  }
}

/**
 * Verify the cryptographic signature on a credential
 */
async function verifySignature(credential: VerifiableCredential): Promise<boolean> {
  try {
    const { proof, ...unsignedCredential } = credential;

    // Recreate the original message that was signed
    const message = JSON.stringify(unsignedCredential);

    // Extract the issuer's address from the DID
    const issuerAddress = extractAddressFromDID(credential.issuer);

    // Recover the signer's address from the signature
    const recoveredAddress = ethers.verifyMessage(message, proof.jws);

    // Check if the recovered address matches the issuer's address
    return recoveredAddress.toLowerCase() === issuerAddress.toLowerCase();
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

/**
 * Check if a credential has been revoked on-chain
 */
async function checkRevocationStatus(
  credential: VerifiableCredential,
  registryAddress: string,
  provider: ethers.Provider
): Promise<boolean> {
  try {
    // Import the StatusList2021Registry ABI
    const registryABI = [
      "function isRevoked(address issuer, uint256 listIndex, uint256 bitIndex) view returns (bool)",
    ];

    // Create contract instance
    const registry = new ethers.Contract(registryAddress, registryABI, provider);

    // Extract issuer address from DID
    const issuerAddress = extractAddressFromDID(credential.issuer);

    // Parse credential status field
    // Note: credentialStatus is optional in W3C VC spec
    if (!credential.credentialStatus) {
      // If no credentialStatus, we can't check revocation
      return false;
    }

    const credentialStatus = credential.credentialStatus as any;

    // Extract status list parameters
    // Format: { statusListIndex: "42", statusListCredential: "...", type: "StatusList2021Entry" }
    if (credentialStatus.type !== "StatusList2021Entry") {
      throw new Error(`Unsupported credential status type: ${credentialStatus.type}`);
    }

    const bitIndex = parseInt(credentialStatus.statusListIndex, 10);

    // Parse list index from statusListCredential URI
    // Format: https://veritas.id/credentials/status/0 where 0 is the listIndex
    const listIndex = parseListIndexFromURI(credentialStatus.statusListCredential);

    // Check revocation on-chain
    if (typeof registry.isRevoked !== 'function') {
      throw new Error('Registry contract does not support isRevoked method');
    }

    const isRevoked = await registry.isRevoked(issuerAddress, listIndex, bitIndex);

    return isRevoked;
  } catch (error) {
    console.error("Revocation check error:", error);
    // On error, we conservatively assume not revoked to avoid false negatives
    return false;
  }
}

/**
 * Parse list index from status list credential URI
 */
function parseListIndexFromURI(uri: string): number {
  // Extract the last segment of the URI as the list index
  // e.g., "https://veritas.id/credentials/status/0" -> 0
  const parts = uri.split('/');
  const lastPart = parts[parts.length - 1];

  if (!lastPart) {
    throw new Error(`Invalid status list credential URI: ${uri}`);
  }

  const listIndex = parseInt(lastPart, 10);

  if (isNaN(listIndex)) {
    throw new Error(`Invalid status list credential URI: ${uri}`);
  }

  return listIndex;
}

/**
 * Extract Ethereum address from a DID
 * Supports did:ethr:polygon format
 */
function extractAddressFromDID(did: string): string {
  // did:ethr:polygon:0x123... -> 0x123...
  const parts = did.split(":");

  if (parts[0] === "did" && parts[1] === "ethr") {
    // For did:ethr format, the address is the last part
    const address = parts[parts.length - 1];
    if (!address) {
      throw new Error(`Invalid DID format: ${did}`);
    }
    return address;
  }

  // For did:key format (future support)
  // We'll need to decode the key and derive the address

  throw new Error(`Unsupported DID format: ${did}`);
}

/**
 * Create a presentation request (for future use)
 */
export interface PresentationRequest {
  challenge: string;
  domain: string;
  credentialTypes: string[];
}

/**
 * Generate a challenge for presentation verification
 */
export function generateChallenge(): string {
  return ethers.hexlify(ethers.randomBytes(32));
}
