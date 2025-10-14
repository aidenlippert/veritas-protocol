import { ethers } from "ethers";
import type {
  ProofOfEmploymentSubject,
  ProofOfEmploymentVC,
  Proof,
} from "@veritas/types";

export interface IssueCredentialOptions {
  holderDID: string;
  claims: Omit<ProofOfEmploymentSubject, "id">;
  issuerPrivateKey: string;
  issuerDID: string;
  expirationDate?: string;
}

/**
 * Issue a Proof of Employment Verifiable Credential
 * @param options Configuration for credential issuance
 * @returns A signed Verifiable Credential
 */
export async function issueCredential(
  options: IssueCredentialOptions
): Promise<ProofOfEmploymentVC> {
  const {
    holderDID,
    claims,
    issuerPrivateKey,
    issuerDID,
    expirationDate,
  } = options;

  // Create the credential subject
  const credentialSubject: ProofOfEmploymentSubject = {
    id: holderDID,
    ...claims,
  };

  // Create the unsigned credential
  const issuanceDate = new Date().toISOString();
  const credentialId = `urn:uuid:${ethers.randomBytes(16).toString()}`;

  const unsignedCredential = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://veritas.id/contexts/employment/v1",
    ],
    id: credentialId,
    type: ["VerifiableCredential", "ProofOfEmploymentCredential"],
    issuer: issuerDID,
    issuanceDate,
    ...(expirationDate && { expirationDate }),
    credentialSubject,
  };

  // Create the proof
  const proof = await createProof(unsignedCredential, issuerPrivateKey, issuerDID);

  // Return the signed credential
  const signedCredential: ProofOfEmploymentVC = {
    ...unsignedCredential,
    proof,
  };

  return signedCredential;
}

/**
 * Create a cryptographic proof for a credential
 * @param credential The unsigned credential
 * @param privateKey The issuer's private key
 * @param issuerDID The issuer's DID
 * @returns A proof object with JWS signature
 */
async function createProof(
  credential: any,
  privateKey: string,
  issuerDID: string
): Promise<Proof> {
  // Create a wallet from the private key
  const wallet = new ethers.Wallet(privateKey);

  // Serialize the credential for signing
  const message = JSON.stringify(credential);

  // Sign the message
  const signature = await wallet.signMessage(message);

  // Create the proof object
  const proof: Proof = {
    type: "JsonWebSignature2020",
    created: new Date().toISOString(),
    proofPurpose: "assertionMethod",
    verificationMethod: `${issuerDID}#key-1`,
    jws: signature,
  };

  return proof;
}

/**
 * Create a DID from an Ethereum address
 * Simple did:key implementation for MVP
 */
export function createDIDFromAddress(address: string): string {
  return `did:ethr:polygon:${address}`;
}

/**
 * Get the address from a private key
 */
export function getAddressFromPrivateKey(privateKey: string): string {
  const wallet = new ethers.Wallet(privateKey);
  return wallet.address;
}
