'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';

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
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile topbar */}
      <div style={{
        display: 'none',
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'var(--black)', padding: '12px 16px',
        alignItems: 'center', justifyContent: 'space-between',
      }} className="mobile-topbar">
        <div style={{
          fontFamily: 'Epilogue', fontWeight: 900,
          fontSize: '18px', color: 'var(--yellow)', letterSpacing: '-1px',
        }}>TALENTAI</div>
        <button onClick={() => setOpen(!open)} style={{
          background: 'none', border: '2px solid var(--yellow)',
          color: 'var(--yellow)', padding: '4px 10px', cursor: 'pointer',
          fontFamily: 'Epilogue', fontWeight: 900, fontSize: '18px',
          borderRadius: '4px',
        }}>
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 98, display: 'none',
        }} className="mobile-overlay" />
      )}

      {/* Sidebar */}
      <aside style={{
        width: '200px', minHeight: '100vh',
        background: 'var(--yellow)',
        borderRight: 'var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, zIndex: 99,
        transition: 'transform 0.25s ease',
      }} className={`sidebar ${open ? 'sidebar-open' : ''}`}>
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

        <nav style={{ flex: 1, padding: '12px 10px' }}>
          {navItems.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                onClick={() => setOpen(false)}
                style={{
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

        <div style={{ padding: '10px', borderTop: 'var(--border)' }}>
          <button onClick={handleLogout} className="btn btn-black" style={{
            width: '100%', justifyContent: 'center', fontSize: '11px',
          }}>
            ✕ Sign Out
          </button>
        </div>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .mobile-topbar { display: flex !important; }
          .mobile-overlay { display: block !important; }
          .sidebar {
            transform: translateX(-100%);
            top: 0;
          }
          .sidebar-open {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </>
  );
}
