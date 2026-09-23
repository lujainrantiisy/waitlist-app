'use client';

import { useState } from 'react';
import { Button } from './components/Button';
import { Input } from './components/Input';

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
    <main className="page center">
      <div className="card">
        <h1 className="title">Join the Waitlist 🚀</h1>
        <p className="subtitle">
          Be the first to get access when we launch. No spam, ever.
        </p>

        {status === 'success' ? (
          <div className="success">
            🎉 You&apos;re on the list! We&apos;ll be in touch soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <Input
              label="البريد الإلكتروني"
                type="email"
                placeholder="enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <Button
              type="submit"
              disabled={status === 'loading'}
              loading={status === 'loading'}
            >
              {status === 'loading' ? 'Joining...' : 'Get Early Access'}
            </Button>

            {status === 'error' && (
              <p className="error-text">{errorMessage}</p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}