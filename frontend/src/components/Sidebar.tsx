'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '▶' },
    { href: '/candidates', label: 'Candidates', icon: '○' },
    { href: '/jobs', label: 'Jobs', icon: '○' },
    { href: '/search', label: 'AI Search', icon: '○' },
    { href: '/chat', label: 'AI Chat', icon: '○' },
    { href: '/upload', label: 'Upload Resume', icon: '○' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const logout = useAuthStore((s) => s.logout);
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <aside style={{
            width: '200px', minHeight: '100vh',
            background: 'var(--yellow)',
            borderRight: 'var(--border)',
            display: 'flex', flexDirection: 'column',
            position: 'fixed', top: 0, left: 0, zIndex: 50,
        }}>
            {/* Logo */}
            <div style={{
                padding: '20px 16px',
                borderBottom: 'var(--border)',
                background: 'var(--black)',
            }}>
                <div style={{
                    fontFamily: 'Epilogue', fontWeight: 900, fontSize: '20px',
                    color: 'var(--yellow)', letterSpacing: '-1px',
                }}>TALENTAI</div>
                <div style={{
                    fontFamily: 'JetBrains Mono', fontSize: '9px',
                    color: '#888', marginTop: '2px', letterSpacing: '1px',
                }}>RECRUITER OS v1.0</div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '12px 10px' }}>
                {navItems.map(({ href, label, icon }) => {
                    const active = pathname === href;
                    return (
                        <Link key={href} href={href} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '9px 10px', marginBottom: '2px',
                            fontFamily: 'Epilogue', fontWeight: 700, fontSize: '12px',
                            textTransform: 'uppercase', letterSpacing: '0.5px',
                            textDecoration: 'none', borderRadius: 'var(--radius)',
                            color: active ? 'var(--white)' : 'var(--black)',
                            background: active ? 'var(--black)' : 'transparent',
                            border: active ? 'var(--border)' : '2px solid transparent',
                            transition: 'all 0.1s',
                        }}>
                            <span style={{ fontSize: '10px' }}>{active ? '▶' : '○'}</span>
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div style={{ padding: '10px', borderTop: 'var(--border)' }}>
                <button onClick={handleLogout} className="btn btn-black" style={{
                    width: '100%', justifyContent: 'center', fontSize: '11px',
                }}>
                    ✕ Sign Out
                </button>
            </div>
        </aside>
    );
}