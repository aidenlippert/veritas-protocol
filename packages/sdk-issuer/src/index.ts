import { ethers } from "ethers";
import type {
  ProofOfEmploymentSubject,
  GitHubReputationSubject,
  VerifiableCredential,
  Proof,
} from "@veritas/types";

export interface IssueCredentialOptions {
  type: "ProofOfEmployment" | "GitHubReputation";
  subject: ProofOfEmploymentSubject | GitHubReputationSubject;
  issuerPrivateKey: string;
  issuerDid: string;
  expiresInDays?: number;
}

/**
 * Issue a Verifiable Credential
 * @param options Configuration for credential issuance
 * @returns A JWS-encoded signed Verifiable Credential
 */
export async function issueCredential(
  options: IssueCredentialOptions
): Promise<string> {
  const {
    type,
    subject,
    issuerPrivateKey,
    issuerDid,
    expiresInDays,
  } = options;

  // Create the unsigned credential
  const issuanceDate = new Date().toISOString();
  const credentialId = `urn:uuid:${ethers.hexlify(ethers.randomBytes(16)).slice(2)}`;

  const expirationDate = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : undefined;

  const credentialType =
    type === "ProofOfEmployment"
      ? "ProofOfEmploymentCredential"
      : "GitHubReputationCredential";

  const context =
    type === "ProofOfEmployment"
      ? "https://veritas.id/contexts/employment/v1"
      : "https://veritas.id/contexts/github/v1";

  const unsignedCredential: VerifiableCredential<any> = {
    "@context": ["https://www.w3.org/2018/credentials/v1", context],
    id: credentialId,
    type: ["VerifiableCredential", credentialType],
    issuer: issuerDid,
    issuanceDate,
    ...(expirationDate && { expirationDate }),
    credentialSubject: subject,
    proof: {} as Proof, // Will be filled by createProof
  };

  // Create the proof
  const proof = await createProof(unsignedCredential, issuerPrivateKey, issuerDid);

  // Return the signed credential as JWS
  const signedCredential: VerifiableCredential<any> = {
    ...unsignedCredential,
    proof,
  };

  // Return as JWS-encoded string for compact transmission
  return JSON.stringify(signedCredential);
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
