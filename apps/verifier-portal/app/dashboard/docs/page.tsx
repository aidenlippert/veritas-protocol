'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function DocsPage() {
  const [apiKey, setApiKey] = useState('YOUR_API_KEY_HERE');

  useEffect(() => {
    const key = localStorage.getItem('verifier_api_key');
    if (key) {
      setApiKey(key);
    }
  }, []);

  const exampleRequest = `POST /verifier/verify
Authorization: Bearer ${apiKey}
Content-Type: application/json

{
  "credential": {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "id": "urn:uuid:...",
    "type": ["VerifiableCredential", "ProofOfEmploymentCredential"],
    "issuer": "did:ethr:polygon:0x...",
    "issuanceDate": "2025-01-01T00:00:00Z",
    "credentialSubject": {
      "id": "did:ethr:polygon:0x...",
      "employer": "Acme Corp",
      "role": "Senior Engineer"
    },
    "proof": { ... }
  }
}`;

  const exampleResponse = `{
  "verified": true,
  "issuer": "did:ethr:polygon:0x...",
  "subject": {
    "id": "did:ethr:polygon:0x...",
    "employer": "Acme Corp",
    "role": "Senior Engineer"
  },
  "feeCharged": 1,
  "remainingBalance": 99
}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-purple-600 hover:text-purple-700">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-8 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
              <p className="text-gray-700 mb-4">
                The Veritas Protocol API allows you to verify credentials on-chain. Each verification
                costs 1 $VERI token and checks:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Credential structure validity</li>
                <li>Cryptographic signature verification</li>
                <li>Expiration date (if present)</li>
                <li>On-chain revocation status</li>
              </ul>
            </section>

            {/* Authentication */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication</h2>
              <p className="text-gray-700 mb-4">
                Include your API key in the Authorization header of every request:
              </p>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                <code>Authorization: Bearer {apiKey}</code>
              </pre>
            </section>

            {/* Endpoint */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Verify Credential</h2>
              <div className="mb-4">
                <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded font-mono text-sm">
                  POST /verifier/verify
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">Request Example</h3>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm mb-6">
                <code>{exampleRequest}</code>
              </pre>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">Response Example</h3>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm mb-6">
                <code>{exampleResponse}</code>
              </pre>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Responses</h3>
              <div className="space-y-3">
                <div>
                  <code className="bg-red-100 text-red-800 px-2 py-1 rounded">402 Payment Required</code>
                  <p className="text-gray-600 text-sm mt-1">Insufficient $VERI balance</p>
                </div>
                <div>
                  <code className="bg-red-100 text-red-800 px-2 py-1 rounded">401 Unauthorized</code>
                  <p className="text-gray-600 text-sm mt-1">Invalid or missing API key</p>
                </div>
                <div>
                  <code className="bg-red-100 text-red-800 px-2 py-1 rounded">400 Bad Request</code>
                  <p className="text-gray-600 text-sm mt-1">Invalid credential format</p>
                </div>
              </div>
            </section>

            {/* Rate Limits */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Rate Limits</h2>
              <p className="text-gray-700">
                Standard rate limit: <strong>10 requests per minute</strong>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Contact us for higher rate limits for enterprise customers.
              </p>
            </section>

            {/* SDKs */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">SDKs & Libraries</h2>
              <div className="space-y-3">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900">JavaScript/TypeScript</h3>
                  <code className="text-sm text-gray-600">npm install @veritas/sdk-verifier</code>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900">Python</h3>
                  <code className="text-sm text-gray-600">pip install veritas-sdk (coming soon)</code>
                </div>
              </div>
            </section>

            {/* Support */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Support</h2>
              <p className="text-gray-700">
                Need help? Contact us at{' '}
                <a href="mailto:support@veritas.id" className="text-purple-600 hover:text-purple-700">
                  support@veritas.id
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
