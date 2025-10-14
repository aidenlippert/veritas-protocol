/**
 * W3C Verifiable Credentials Data Model Types
 * Based on: https://www.w3.org/TR/vc-data-model/
 */

export interface DID {
  id: string; // e.g., "did:key:z6Mkf..."
  publicKey: string;
}

export interface VerifiableCredential<T = unknown> {
  "@context": string[];
  id: string;
  type: string[];
  issuer: string; // DID of the issuer
  issuanceDate: string; // ISO 8601
  expirationDate?: string; // ISO 8601
  credentialSubject: T;
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
