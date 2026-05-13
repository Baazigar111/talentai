'use client';
import { useEffect, useState } from 'react';
import { jobsAPI } from '@/lib/api';

export default function JobsPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        title: '', description: '', required_skills: '',
        min_experience: 0, location: '', salary_range: '',
    });

    useEffect(() => {
        jobsAPI.getAll().then(r => setJobs(r.data)).finally(() => setLoading(false));
    }, []);

    const createJob = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await jobsAPI.create({
                ...form,
                required_skills: form.required_skills.split(',').map(s => s.trim()).filter(Boolean),
            });
            setJobs(prev => [...prev, res.data]);
            setShowForm(false);
            setForm({ title: '', description: '', required_skills: '', min_experience: 0, location: '', salary_range: '' });
        } finally { setSubmitting(false); }
    };

    return (
        <div style={{ maxWidth: '960px' }} className="animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#999', marginBottom: '6px', letterSpacing: '1px' }}>
            // JOB POSTINGS
                    </div>
                    <h1 style={{ fontFamily: 'Epilogue', fontWeight: 900, fontSize: '36px', letterSpacing: '-1.5px' }}>Jobs</h1>
                </div>
                <button className="btn btn-yellow" onClick={() => setShowForm(!showForm)}>
                    {showForm ? '✕ Cancel' : '+ New Job'}
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="card" style={{ padding: '24px', marginBottom: '20px' }} >
                    <div style={{ fontFamily: 'Epilogue', fontWeight: 900, fontSize: '18px', marginBottom: '20px', borderBottom: 'var(--border)', paddingBottom: '12px' }}>
                        Create New Job Posting
                    </div>
                    <form onSubmit={createJob} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div style={{ gridColumn: '1/-1' }}>
                            <label>Job Title *</label>
                            <input placeholder="e.g. Senior Full Stack Developer" value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })} required />
                        </div>
                        <div style={{ gridColumn: '1/-1' }}>
                            <label>Description *</label>
                            <textarea placeholder="Describe the role, responsibilities..." value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                required style={{ minHeight: '100px', resize: 'vertical' }} />
                        </div>
                        <div style={{ gridColumn: '1/-1' }}>
                            <label>Required Skills (comma-separated) *</label>
                            <input placeholder="Python, React, FastAPI, PostgreSQL" value={form.required_skills}
                                onChange={e => setForm({ ...form, required_skills: e.target.value })} required />
                        </div>
                        <div>
                            <label>Min Experience (years)</label>
                            <input type="number" min={0} value={form.min_experience}
                                onChange={e => setForm({ ...form, min_experience: +e.target.value })} />
                        </div>
                        <div>
                            <label>Location</label>
                            <input placeholder="Remote / Bangalore / Delhi" value={form.location}
                                onChange={e => setForm({ ...form, location: e.target.value })} />
                        </div>
                        <div>
                            <label>Salary Range</label>
                            <input placeholder="8-15 LPA" value={form.salary_range}
                                onChange={e => setForm({ ...form, salary_range: e.target.value })} />
                        </div>
                        <div style={{ gridColumn: '1/-1' }}>
                            <button className="btn btn-black" type="submit" disabled={submitting}>
                                {submitting ? 'Creating...' : '→ Post Job'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Jobs List */}
            {loading ? (
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#999', padding: '40px', textAlign: 'center' }}>Loading...</div>
            ) : jobs.length === 0 ? (
                <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Epilogue', fontWeight: 900, fontSize: '24px', marginBottom: '8px' }}>No jobs posted yet.</div>
                    <button className="btn btn-yellow" onClick={() => setShowForm(true)}>Post Your First Job →</button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {jobs.map(job => (
                        <div key={job.id} className="card" style={{ padding: '18px 20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                        <span className="tag tag-black" style={{ fontSize: '9px' }}>ID #{job.id}</span>
                                        {job.location && <span className="tag tag-white" style={{ fontSize: '9px' }}>{job.location}</span>}
                                        {job.salary_range && <span className="tag tag-green" style={{ fontSize: '9px' }}>{job.salary_range}</span>}
                                    </div>
                                    <div style={{ fontFamily: 'Epilogue', fontWeight: 900, fontSize: '18px', letterSpacing: '-0.5px', marginBottom: '6px' }}>
                                        {job.title}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px', lineHeight: 1.5 }}>
                                        {job.description?.slice(0, 120)}...
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {(job.required_skills || []).map((s: string) => (
                                            <span key={s} className="tag tag-blue">{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ marginLeft: '16px', flexShrink: 0, textAlign: 'right' }}>
                                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#999', marginBottom: '6px' }}>
                                        Min {job.min_experience}yr exp
                                    </div>
                                    <a href="/candidates" className="btn btn-yellow" style={{ fontSize: '11px', textDecoration: 'none' }}>
                                        Rank Candidates →
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}