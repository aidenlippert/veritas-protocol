/**
 * W3C Verifiable Credentials Data Model Types
 * Based on: https://www.w3.org/TR/vc-data-model/
 */

export interface DID {
  id: string; // e.g., "did:key:z6Mkf..."
  publicKey: string;
}

/**
 * Revocation Status
 */
export interface RevocationStatus {
  id: string; // URI to the status list
  type: "StatusList2021Entry";
  statusPurpose: "revocation";
  statusListIndex: string;
  statusListCredential: string;
}

export interface VerifiableCredential<T = unknown> {
  "@context": string[];
  id: string;
  type: string[];
  issuer: string; // DID of the issuer
  issuanceDate: string; // ISO 8601
  expirationDate?: string; // ISO 8601
  credentialSubject: T;
  credentialStatus?: RevocationStatus; // Optional revocation status
  proof: Proof;
}

export interface Proof {
  type: string; // e.g., "JsonWebSignature2020"
  created: string; // ISO 8601
  proofPurpose: string; // e.g., "assertionMethod"
  verificationMethod: string; // DID + key reference
  jws: string; // The actual signature
}

/**
 * Proof of Employment Credential Subject
 */
export interface ProofOfEmploymentSubject {
  id: string; // DID of the holder
  employer: string;
  role: string;
  startDate: string; // ISO 8601
  endDate?: string; // ISO 8601
}

export type ProofOfEmploymentVC = VerifiableCredential<ProofOfEmploymentSubject>;

/**
 * GitHub Reputation Credential Subject
 */
export interface GitHubReputationSubject {
  id: string; // DID of the holder
  username: string;
  profileUrl: string;
  reputation: {
    followers: number;
    publicRepos: number;
    accountAge: number; // days since account creation
  };
  verifiedAt: string; // ISO 8601
}

export type GitHubReputationVC = VerifiableCredential<GitHubReputationSubject>;

/**
 * Verifiable Presentation
 * Used when a holder presents one or more VCs to a verifier
 */
export interface VerifiablePresentation {
  "@context": string[];
  type: string[];
  verifiableCredential: VerifiableCredential[];
  proof: Proof;
  holder: string; // DID of the holder
}
