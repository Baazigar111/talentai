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
        <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            {/* Left — Black Hero */}
            <div style={{
                background: 'var(--black)', display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', padding: '40px',
            }}>
                <div style={{ fontFamily: 'Epilogue', fontWeight: 900, fontSize: '22px', color: 'var(--yellow)', letterSpacing: '-1px' }}>
                    TALENTAI
                </div>
                <div>
                    <div style={{
                        display: 'inline-block', background: 'var(--yellow)',
                        border: 'var(--border)', borderColor: 'var(--yellow)',
                        padding: '6px 12px', fontSize: '11px', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px',
                        borderRadius: 'var(--radius)',
                    }}>
                        AI-Powered ATS
                    </div>
                    <div style={{
                        fontFamily: 'Epilogue', fontWeight: 900, fontSize: '48px',
                        color: 'white', lineHeight: 1.05, letterSpacing: '-2px',
                    }}>
                        Hire<br />
                        <span style={{ color: 'var(--yellow)' }}>smarter.</span><br />
                        Not harder.
                    </div>
                    <p style={{ color: '#666', fontSize: '14px', marginTop: '20px', lineHeight: 1.6, maxWidth: '320px' }}>
                        Parse resumes, rank candidates with AI, and find the perfect hire using semantic search.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    {['Resume Parsing', 'AI Ranking', 'Semantic Search', 'Free Forever'].map(f => (
                        <div key={f} style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#555' }}>✓ {f}</div>
                    ))}
                </div>
            </div>

            {/* Right — Form */}
            <div style={{
                background: 'var(--white)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', padding: '40px',
            }}>
                <div style={{ width: '100%', maxWidth: '360px' }}>
                    <div style={{ marginBottom: '28px' }}>
                        <h1 style={{ fontFamily: 'Epilogue', fontWeight: 900, fontSize: '28px', letterSpacing: '-1px' }}>
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
                                <input placeholder="Ankit Kumar Gupta" value={form.full_name}
                                    onChange={e => setForm({ ...form, full_name: e.target.value })} required />
                            </div>
                        )}
                        <div>
                            <label>Email</label>
                            <input type="email" placeholder="you@company.com" value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })} required />
                        </div>
                        <div>
                            <label>Password</label>
                            <input type="password" placeholder="••••••••" value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })} required />
                        </div>

                        {error && (
                            <div style={{
                                background: 'var(--red)', color: 'white', padding: '10px 14px',
                                borderRadius: 'var(--radius)', fontSize: '12px', fontWeight: 700,
                                border: 'var(--border)',
                            }}>{error}</div>
                        )}

                        <button className="btn btn-black" type="submit" disabled={loading}
                            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '4px', fontSize: '13px' }}>
                            {loading ? '...' : mode === 'login' ? '→ Sign In' : '→ Create Account'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#999' }}>
                        {mode === 'login' ? "No account? " : 'Have an account? '}
                        <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                            style={{ background: 'none', border: 'none', color: 'var(--black)', cursor: 'pointer', fontWeight: 700, fontSize: '12px', textDecoration: 'underline' }}>
                            {mode === 'login' ? 'Sign up free' : 'Sign in'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}