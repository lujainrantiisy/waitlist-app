'use client';

import { useState } from 'react';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
      
      if (!webhookUrl) {
        throw new Error('N8N Webhook URL is not configured in .env.local');
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'web' }),
      });

      if (!response.ok) {
        throw new Error('Failed to join waitlist. Please try again.');
      }

      setStatus('success');
      setEmail('');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong.');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-950 text-white">
      <div className="w-full max-w-md p-8 bg-slate-900 rounded-2xl shadow-xl border border-slate-800">
        <h1 className="text-3xl font-bold mb-2 text-center">Join the Waitlist 🚀</h1>
        <p className="text-slate-400 text-center mb-6 text-sm">
          Be the first to get access when we launch. No spam, ever.
        </p>

        {status === 'success' ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-center">
            🎉 You&apos;re on the list! We&apos;ll be in touch soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 font-medium rounded-xl transition duration-200"
            >
              {status === 'loading' ? 'Joining...' : 'Get Early Access'}
            </button>
            {status === 'error' && (
              <p className="text-red-400 text-xs text-center">{errorMessage}</p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}