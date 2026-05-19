'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ email: '', password: '', full_name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = mode === 'login'
        ? await authAPI.login({ email: form.email, password: form.password })
        : await authAPI.register(form);
      login(res.data.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          flex-direction: row;
        }
        .login-hero {
          flex: 1;
          background: var(--black);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 40px;
        }
        .login-hero-title {
          font-family: Epilogue, sans-serif;
          font-weight: 900;
          font-size: 48px;
          color: white;
          line-height: 1.05;
          letter-spacing: -2px;
        }
        .login-form-side {
          flex: 1;
          background: var(--white);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }
        @media (max-width: 768px) {
          .login-container {
            flex-direction: column !important;
          }
          .login-hero {
            min-height: 220px !important;
            padding: 24px !important;
            justify-content: center !important;
            gap: 12px;
          }
          .login-hero-title {
            font-size: 30px !important;
            letter-spacing: -1px !important;
          }
          .login-hero-features {
            display: none !important;
          }
          .login-form-side {
            padding: 24px !important;
            align-items: flex-start !important;
          }
        }
      `}</style>

      <div className="login-container">
        {/* Left — Black Hero */}
        <div className="login-hero">
          <div style={{
            fontFamily: 'Epilogue', fontWeight: 900,
            fontSize: '22px', color: 'var(--yellow)', letterSpacing: '-1px',
          }}>
            TALENTAI
          </div>
          <div>
            <div style={{
              display: 'inline-block', background: 'var(--yellow)',
              padding: '6px 12px', fontSize: '11px', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '1px',
              marginBottom: '20px', borderRadius: 'var(--radius)',
              border: 'var(--border)',
            }}>
              AI-Powered ATS
            </div>
            <div className="login-hero-title">
              Hire<br />
              <span style={{ color: 'var(--yellow)' }}>smarter.</span><br />
              Not harder.
            </div>
            <p style={{
              color: '#666', fontSize: '14px',
              marginTop: '20px', lineHeight: 1.6, maxWidth: '320px',
            }}>
              Parse resumes, rank candidates with AI, and find the perfect hire using semantic search.
            </p>
          </div>
          <div className="login-hero-features" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {['Resume Parsing', 'AI Ranking', 'Semantic Search', 'Free Forever'].map(f => (
              <div key={f} style={{
                fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#555',
              }}>✓ {f}</div>
            ))}
          </div>
        </div>

        {/* Right — Form */}
        <div className="login-form-side">
          <div style={{ width: '100%', maxWidth: '360px' }}>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{
                fontFamily: 'Epilogue', fontWeight: 900,
                fontSize: '28px', letterSpacing: '-1px',
              }}>
                {mode === 'login' ? 'Welcome back.' : 'Get started.'}
              </h1>
              <p style={{ color: '#777', fontSize: '13px', marginTop: '4px' }}>
                {mode === 'login' ? 'Sign in to your workspace' : 'Create your free account'}
              </p>
            </div>

            <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {mode === 'register' && (
                <div>
                  <label>Full Name</label>
                  <input
                    placeholder="Ankit Kumar Gupta"
                    value={form.full_name}
                    onChange={e => setForm({ ...form, full_name: e.target.value })}
                    required
                  />
                </div>
              )}
              <div>
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>

              {error && (
                <div style={{
                  background: 'var(--red)', color: 'white',
                  padding: '10px 14px', borderRadius: 'var(--radius)',
                  fontSize: '12px', fontWeight: 700, border: 'var(--border)',
                }}>
                  {error}
                </div>
              )}

              <button className="btn btn-black" type="submit" disabled={loading}
                style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '4px' }}>
                {loading ? '...' : mode === 'login' ? '→ Sign In' : '→ Create Account'}
              </button>
            </form>

            <div style={{
              textAlign: 'center', marginTop: '20px',
              fontSize: '12px', color: '#999',
            }}>
              {mode === 'login' ? "No account? " : 'Have an account? '}
              <button
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--black)', cursor: 'pointer',
                  fontWeight: 700, fontSize: '12px', textDecoration: 'underline',
                }}>
                {mode === 'login' ? 'Sign up free' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
