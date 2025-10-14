'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem('verifier_api_key');
    if (!key) {
      router.push('/');
      return;
    }

    setApiKey(key);
    fetchBalance(key);
  }, [router]);

  const fetchBalance = async (key: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/verifier/balance`, {
        headers: {
          'Authorization': `Bearer ${key}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }

      const data = await response.json();
      setBalance(data.balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('verifier_api_key');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Verifier Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* API Key Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your API Key</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 font-mono text-sm break-all">
              {apiKey}
            </div>
            <button
              onClick={copyApiKey}
              className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              {copied ? '✓ Copied!' : 'Copy API Key'}
            </button>
            <p className="mt-3 text-sm text-gray-600">
              Keep this key secure. You&apos;ll need it to verify credentials via the API.
            </p>
          </div>

          {/* Balance Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">$VERI Balance</h2>
            <div className="text-5xl font-bold text-purple-600 mb-4">
              {balance?.toFixed(2) ?? '0.00'}
            </div>
            <p className="text-gray-600 mb-4">
              Each verification costs 1 $VERI token
            </p>
            <Link
              href="/dashboard/fund"
              className="block w-full bg-green-600 text-white text-center py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Add Funds
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/dashboard/docs"
              className="p-4 border border-gray-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 mb-2">📚 API Docs</h3>
              <p className="text-sm text-gray-600">Learn how to verify credentials</p>
            </Link>

            <Link
              href="/dashboard/fund"
              className="p-4 border border-gray-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 mb-2">💰 Fund Account</h3>
              <p className="text-sm text-gray-600">Add $VERI tokens to your balance</p>
            </Link>

            <a
              href="https://github.com/veritas-protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border border-gray-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 mb-2">🔗 GitHub</h3>
              <p className="text-sm text-gray-600">View source code and examples</p>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
