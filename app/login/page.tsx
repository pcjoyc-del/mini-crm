'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('admin@sofaplus.co.th');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.error?.message || 'Login failed');
      }

      window.location.href = '/leads';
    } catch (err) {
      setError((err as Error).message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5efe5] p-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-sm"
      >
        <h1 className="text-center text-2xl font-bold">Login</h1>

        <div>
          <label className="mb-1 block text-sm">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>

        {error ? <div className="text-sm text-red-600">{error}</div> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-[#6f4e37] px-4 py-3 text-sm font-bold text-white"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div className="text-center text-xs text-stone-500">
          admin@sofaplus.co.th / 123456
        </div>
      </form>
    </main>
  );
}