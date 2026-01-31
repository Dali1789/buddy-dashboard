'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const redirect = searchParams.get('redirect') || '/';
        router.push(redirect);
        router.refresh();
      } else {
        setError('Falsches Passwort');
      }
    } catch {
      setError('Verbindungsfehler');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">🤖</div>
        <h1 className="text-xl font-semibold text-white">Moltbot Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">Bitte Passwort eingeben</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Passwort"
            autoFocus
            disabled={isLoading}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 disabled:opacity-50"
          />

          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={!password || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg text-sm font-medium transition-colors"
          >
            {isLoading ? 'Prüfe...' : 'Einloggen'}
          </button>
        </div>
      </form>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="card p-8">
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">🤖</div>
        <h1 className="text-xl font-semibold text-white">Moltbot Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">Laden...</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="w-full max-w-sm">
        <Suspense fallback={<LoginFallback />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
