'use client';

import { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import QRCode from 'qrcode';

type Step = 'scan' | 'sign' | 'display-proof';

export default function LinkWalletPage() {
  const [step, setStep] = useState<Step>('scan');
  const [challenge, setChallenge] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [proofQR, setProofQR] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (step === 'display-proof' && address && signature) {
      generateProofQR();
    }
  }, [step, address, signature]);

  const startScanning = async () => {
    setIsScanning(true);
    setError('');

    try {
      const html5QrCode = new Html5Qrcode('qr-reader');

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Successfully scanned
          setChallenge(decodedText);
          html5QrCode.stop();
          setIsScanning(false);
          setStep('sign');
        },
        (errorMessage) => {
          // Ignore scan errors (they happen continuously)
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start camera');
      setIsScanning(false);
    }
  };

  const connectAndSign = async () => {
    setError('');

    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }

      const userAddress = accounts[0];
      setAddress(userAddress);

      // Sign the challenge message using personal_sign (EIP-191)
      const sig = await window.ethereum.request({
        method: 'personal_sign',
        params: [challenge, userAddress],
      });

      setSignature(sig);
      setStep('display-proof');
    } catch (err: any) {
      if (err.code === 4001) {
        setError('Signature request was rejected. Please try again.');
      } else {
        setError(err.message || 'Failed to sign message');
      }
    }
  };

  const generateProofQR = async () => {
    try {
      // Format: address|signature
      const proofData = `${address}|${signature}`;
      const qrDataUrl = await QRCode.toDataURL(proofData, {
        width: 400,
        margin: 2,
      });
      setProofQR(qrDataUrl);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    }
  };

  const reset = () => {
    setStep('scan');
    setChallenge('');
    setSignature('');
    setAddress('');
    setProofQR('');
    setError('');
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Link Wallet to Veritas
            </h1>
            <p className="text-gray-600">
              {step === 'scan' && 'Scan the QR code from your Veritas wallet'}
              {step === 'sign' && 'Sign the message with your wallet'}
              {step === 'display-proof' && 'Scan this QR code with your Veritas wallet'}
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Scan Challenge QR */}
          {step === 'scan' && (
            <div className="space-y-6">
              <div className="bg-gray-100 rounded-lg p-8">
                {!isScanning ? (
                  <div className="text-center">
                    <div className="text-6xl mb-4">📷</div>
                    <p className="text-gray-600 mb-4">
                      Click below to activate your camera and scan the QR code
                    </p>
                    <button
                      onClick={startScanning}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Start Camera
                    </button>
                  </div>
                ) : (
                  <div>
                    <div id="qr-reader" className="w-full"></div>
                    <p className="text-center text-gray-600 mt-4">
                      Position the QR code within the frame
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  ℹ️ Make sure the QR code from your Veritas wallet is clearly visible on your phone screen
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Sign with MetaMask */}
          {step === 'sign' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm font-semibold mb-2">
                  ✓ Challenge Scanned Successfully
                </p>
              </div>

              <div className="bg-gray-100 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-2 font-semibold uppercase">
                  Challenge Message:
                </p>
                <p className="text-sm text-gray-700 font-mono whitespace-pre-wrap break-all">
                  {challenge}
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-gray-700">
                  Click below to connect your wallet and sign this message to prove ownership.
                </p>

                <button
                  onClick={connectAndSign}
                  className="w-full bg-orange-500 text-white px-6 py-4 rounded-lg font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-3"
                >
                  <span className="text-2xl">🦊</span>
                  <span>Connect MetaMask & Sign</span>
                </button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Only sign this message if you trust the DID shown in the challenge
                </p>
              </div>

              <button
                onClick={reset}
                className="w-full text-gray-600 hover:text-gray-800 py-2"
              >
                Start Over
              </button>
            </div>
          )}

          {/* Step 3: Display Signed Proof QR */}
          {step === 'display-proof' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm font-semibold mb-2">
                  ✓ Message Signed Successfully
                </p>
                <p className="text-green-700 text-xs">
                  Address: {address}
                </p>
              </div>

              <div className="bg-white border-4 border-blue-600 rounded-lg p-8">
                {proofQR ? (
                  <div className="text-center">
                    <img src={proofQR} alt="Proof QR Code" className="mx-auto" />
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    Generating QR code...
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  📱 Scan this QR code with your Veritas wallet to complete the linking process
                </p>
              </div>

              <button
                onClick={reset}
                className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                Link Another Wallet
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">How It Works</h2>
          <ol className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">1.</span>
              <span>Open your Veritas wallet and tap "Link New Account"</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">2.</span>
              <span>Choose which blockchain (Ethereum, Solana, or Bitcoin)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">3.</span>
              <span>A challenge QR code will appear on your phone</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">4.</span>
              <span>Come to this page on your desktop and scan that QR code</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">5.</span>
              <span>Connect your wallet (MetaMask) and sign the message</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">6.</span>
              <span>A new QR code will appear with your signature</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">7.</span>
              <span>Scan this proof QR code with your Veritas wallet to complete the link</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

// Add MetaMask types
declare global {
  interface Window {
    ethereum?: any;
  }
}
