'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { verifyCredential } from '@veritas/sdk-verifier';
import type { VerifiableCredential, ProofOfEmploymentSubject } from '@veritas/types';

type VerificationState =
  | { status: 'idle' }
  | { status: 'scanning' }
  | { status: 'verifying' }
  | { status: 'success'; credential: VerifiableCredential }
  | { status: 'error'; message: string };

export default function VerifierPage() {
  const [state, setState] = useState<VerificationState>({ status: 'idle' });
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerDivId = 'qr-scanner';

  const handleScan = async (decodedText: string) => {
    // Stop the scanner
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }

    setState({ status: 'verifying' });

    try {
      // Parse the QR code data
      const credential: VerifiableCredential = JSON.parse(decodedText);

      // Verify the credential
      const verificationResult = await verifyCredential({ credential });

      if (verificationResult.verified) {
        setState({ status: 'success', credential });
      } else {
        setState({
          status: 'error',
          message: verificationResult.errors?.join(', ') || 'Verification failed',
        });
      }
    } catch (error) {
      setState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Invalid QR code',
      });
    }
  };

  const startScanning = () => {
    setState({ status: 'scanning' });

    // Initialize scanner on next tick
    setTimeout(() => {
      if (!scannerRef.current) {
        scannerRef.current = new Html5QrcodeScanner(
          scannerDivId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          false
        );

        scannerRef.current.render(
          (decodedText) => handleScan(decodedText),
          (error) => console.log('Scanner error:', error)
        );
      }
    }, 100);
  };

  const resetScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setState({ status: 'idle' });
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
              Veritas Protocol
            </h1>
            <p className="text-xl text-blue-200">
              Instant Credential Verification
            </p>
          </div>

          {state.status === 'idle' && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-12 text-center border border-white/20">
              <div className="text-7xl mb-6">🔍</div>
              <h2 className="text-3xl font-semibold text-white mb-4">
                Ready to Verify
              </h2>
              <p className="text-blue-200 mb-8 text-lg">
                Scan a Veritas credential QR code to instantly verify authenticity
              </p>
              <button
                onClick={startScanning}
                className="bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold py-4 px-10 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Start Scanning
              </button>
            </div>
          )}

          {state.status === 'scanning' && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Position QR Code in Frame
                </h2>
                <p className="text-blue-200">
                  Point your camera at the credential QR code
                </p>
              </div>

              <div id={scannerDivId} className="mb-6 rounded-lg overflow-hidden" />

              <button
                onClick={resetScanner}
                className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 rounded-lg transition-colors border border-white/30"
              >
                Cancel
              </button>
            </div>
          )}

          {state.status === 'verifying' && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-12 text-center border border-white/20">
              <div className="animate-spin text-7xl mb-6">⚙️</div>
              <h2 className="text-3xl font-semibold text-white mb-2">
                Verifying Credential...
              </h2>
              <p className="text-blue-200">
                Checking signature and validity
              </p>
            </div>
          )}

          {state.status === 'success' && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-12 border border-white/20">
              <div className="text-center mb-8">
                <div className="text-7xl mb-4">✅</div>
                <h2 className="text-4xl font-bold text-green-400 mb-2">
                  Verified
                </h2>
                <p className="text-blue-200 text-lg">
                  This credential is authentic
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-6 space-y-4 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Credential Details
                </h3>

                {(() => {
                  const subject = state.credential.credentialSubject as ProofOfEmploymentSubject;
                  return (
                    <>
                      <div className="flex justify-between py-3 border-b border-white/10">
                        <span className="font-medium text-blue-300">Role</span>
                        <span className="text-white font-semibold">{subject.role}</span>
                      </div>

                      <div className="flex justify-between py-3 border-b border-white/10">
                        <span className="font-medium text-blue-300">Employer</span>
                        <span className="text-white font-semibold">{subject.employer}</span>
                      </div>

                      <div className="flex justify-between py-3 border-b border-white/10">
                        <span className="font-medium text-blue-300">Start Date</span>
                        <span className="text-white">
                          {new Date(subject.startDate).toLocaleDateString()}
                        </span>
                      </div>

                      {subject.endDate && (
                        <div className="flex justify-between py-3 border-b border-white/10">
                          <span className="font-medium text-blue-300">End Date</span>
                          <span className="text-white">
                            {new Date(subject.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between py-3 border-b border-white/10">
                        <span className="font-medium text-blue-300">Issued</span>
                        <span className="text-white">
                          {new Date(state.credential.issuanceDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex justify-between py-3">
                        <span className="font-medium text-blue-300">Issuer</span>
                        <span className="text-white text-sm font-mono">
                          {state.credential.issuer.slice(0, 20)}...
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>

              <button
                onClick={resetScanner}
                className="w-full mt-8 bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                Scan Another Credential
              </button>
            </div>
          )}

          {state.status === 'error' && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-12 border border-white/20">
              <div className="text-center mb-8">
                <div className="text-7xl mb-4">❌</div>
                <h2 className="text-4xl font-bold text-red-400 mb-2">
                  Verification Failed
                </h2>
                <p className="text-blue-200 mb-6">
                  This credential could not be verified
                </p>
                <div className="bg-red-950/50 border border-red-500 rounded-lg p-4">
                  <p className="text-red-300 font-medium break-words">{state.message}</p>
                </div>
              </div>

              <button
                onClick={resetScanner}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="text-center py-8 text-blue-300 text-sm">
        <p>Powered by Veritas Protocol • Built with precision. Engineered for scale.</p>
      </footer>
    </div>
  );
}
