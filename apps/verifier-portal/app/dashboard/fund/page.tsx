'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FundPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [amount, setAmount] = useState('100');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem('verifier_api_key');
    if (!key) {
      router.push('/');
      return;
    }
    setApiKey(key);
  }, [router]);

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/verifier/fund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });

      if (!response.ok) {
        throw new Error('Failed to add funds');
      }

      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (error) {
      console.error('Error adding funds:', error);
      alert('Failed to add funds');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-purple-600 hover:text-purple-700">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Fund Account</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Add $VERI Tokens</h2>

          <div className="mb-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Demo Mode:</strong> This is a testnet demo. In production, you would send real $VERI tokens to fund your account.
              </p>
            </div>

            <form onSubmit={handleFund} className="space-y-6">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount ($VERI)
                </label>
                <input
                  id="amount"
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-black"
                  placeholder="100"
                />
                <p className="mt-2 text-sm text-gray-600">
                  Each verification costs 1 $VERI token
                </p>
              </div>

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  ✅ Funds added successfully! Redirecting...
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || success}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : success ? 'Success!' : 'Add Funds'}
              </button>
            </form>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">How Funding Works (Production)</h3>
            <ol className="space-y-3 text-sm text-gray-600">
              <li className="flex">
                <span className="font-bold text-purple-600 mr-2">1.</span>
                <span>Purchase $VERI tokens from supported exchanges</span>
              </li>
              <li className="flex">
                <span className="font-bold text-purple-600 mr-2">2.</span>
                <span>Send $VERI tokens to our protocol wallet address</span>
              </li>
              <li className="flex">
                <span className="font-bold text-purple-600 mr-2">3.</span>
                <span>Your account balance updates automatically after confirmation</span>
              </li>
              <li className="flex">
                <span className="font-bold text-purple-600 mr-2">4.</span>
                <span>Start verifying credentials immediately</span>
              </li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
