'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, init } = useAuthStore();
    const router = useRouter();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        init();
        // Small delay to let zustand update before checking
        setTimeout(() => setReady(true), 50);
    }, []);

    useEffect(() => {
        if (ready) {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
            }
        }
    }, [ready]);

    if (!ready) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: 'var(--white)',
            }}>
                <div style={{
                    fontFamily: 'JetBrains Mono', fontSize: '12px',
                    color: '#999', letterSpacing: '1px',
                }}>
                    Loading...
                </div>
            </div>
        );
    }

    const token = localStorage.getItem('token');
    if (!token) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{
                marginLeft: '200px',
                flex: 1,
                padding: '2rem',
                minHeight: '100vh',
                background: 'var(--white)',
            }}>
                {children}
            </main>
        </div>
    );
}