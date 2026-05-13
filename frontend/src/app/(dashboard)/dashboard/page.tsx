'use client';
import { useEffect, useState } from 'react';
import { jobsAPI } from '@/lib/api';
import Link from 'next/link';

const StatCard = ({ value, label, bg, color }: any) => (
    <div style={{
        background: bg, border: 'var(--border)', borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)', padding: '20px',
    }}>
        <div style={{ fontFamily: 'Epilogue', fontWeight: 900, fontSize: '42px', letterSpacing: '-2px', color, lineHeight: 1 }}>
            {value}
        </div>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color, opacity: 0.7, marginTop: '6px' }}>
            {label}
        </div>
    </div>
);

export default function DashboardPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        jobsAPI.getAll().then(r => setJobs(r.data)).finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ maxWidth: '960px' }} className="animate-fade">

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#999', marginBottom: '6px', letterSpacing: '1px' }}>
            // PIPELINE OVERVIEW
                    </div>
                    <h1 style={{ fontFamily: 'Epilogue', fontWeight: 900, fontSize: '36px', letterSpacing: '-1.5px', lineHeight: 1 }}>
                        Dashboard
                    </h1>
                </div>
                <Link href="/upload" className="btn btn-yellow">
                    + Upload Resume
                </Link>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                <StatCard value="1" label="Candidates" bg="var(--yellow)" color="var(--black)" />
                <StatCard value={jobs.length} label="Active Jobs" bg="var(--blue)" color="white" />
                <StatCard value="58%" label="Avg ATS Score" bg="var(--green)" color="var(--black)" />
                <StatCard value="18" label="Skills Indexed" bg="var(--black)" color="var(--yellow)" />
            </div>

            {/* Jobs Table */}
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                {/* Table Header */}
                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 120px 120px 100px',
                    padding: '12px 20px', background: 'var(--black)', gap: '12px',
                }}>
                    {['Job Title', 'Location', 'Salary', 'Skills'].map(h => (
                        <div key={h} style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {h}
                        </div>
                    ))}
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontFamily: 'JetBrains Mono', fontSize: '12px' }}>
                        Loading...
                    </div>
                ) : jobs.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <div style={{ fontFamily: 'Epilogue', fontWeight: 900, fontSize: '18px', marginBottom: '8px' }}>No jobs yet.</div>
                        <Link href="/jobs" className="btn btn-yellow" style={{ fontSize: '12px' }}>Create First Job →</Link>
                    </div>
                ) : (
                    jobs.map((job, i) => (
                        <div key={job.id} style={{
                            display: 'grid', gridTemplateColumns: '1fr 120px 120px 100px',
                            padding: '14px 20px', gap: '12px', alignItems: 'center',
                            borderTop: i === 0 ? 'none' : '1px solid #eee',
                            transition: 'background 0.1s',
                        }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fffde7'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'white'}
                        >
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '14px' }}>{job.title}</div>
                                <div style={{ fontSize: '11px', color: '#999', marginTop: '2px', fontFamily: 'JetBrains Mono' }}>ID #{job.id}</div>
                            </div>
                            <div style={{ fontSize: '12px', color: '#555' }}>{job.location || '—'}</div>
                            <div style={{ fontSize: '12px', color: '#555' }}>{job.salary_range || '—'}</div>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {(job.required_skills || []).slice(0, 2).map((s: string) => (
                                    <span key={s} className="tag tag-blue" style={{ fontSize: '9px' }}>{s}</span>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Quick Links */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '24px' }}>
                {[
                    { href: '/search', label: 'AI Semantic Search', desc: 'Find candidates with natural language', color: 'var(--blue)', text: 'white' },
                    { href: '/chat', label: 'AI Recruiter Chat', desc: 'Ask questions about your candidates', color: 'var(--yellow)', text: 'var(--black)' },
                    { href: '/candidates', label: 'View Candidates', desc: 'See all ranked candidates', color: 'var(--black)', text: 'var(--yellow)' },
                ].map(({ href, label, desc, color, text }) => (
                    <Link key={href} href={href} style={{
                        background: color, border: 'var(--border)', borderRadius: 'var(--radius)',
                        boxShadow: 'var(--shadow)', padding: '18px', textDecoration: 'none',
                        display: 'block', transition: 'transform 0.1s, box-shadow 0.1s',
                    }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translate(-2px,-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-lg)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow)'; }}
                    >
                        <div style={{ fontFamily: 'Epilogue', fontWeight: 900, fontSize: '15px', color: text, marginBottom: '4px' }}>{label}</div>
                        <div style={{ fontSize: '12px', color: text, opacity: 0.7 }}>{desc}</div>
                    </Link>
                ))}
            </div>
        </div>
    );
}