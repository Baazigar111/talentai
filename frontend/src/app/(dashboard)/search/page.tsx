'use client';
import { useState } from 'react';
import { aiAPI } from '@/lib/api';

const EXAMPLES = [
    'React developer with FastAPI experience',
    'Machine learning engineer with Python',
    'Full stack developer Node.js PostgreSQL',
    'Computer vision engineer with deep learning',
];

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const search = async (q?: string) => {
        const searchQuery = q || query;
        if (!searchQuery.trim()) return;
        setLoading(true); setSearched(true);
        try {
            const res = await aiAPI.search(searchQuery, 10);
            setResults(res.data.results);
        } finally { setLoading(false); }
    };

    return (
        <div style={{ maxWidth: '800px' }} className="animate-fade">
            <div style={{ marginBottom: '28px' }}>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#999', marginBottom: '6px', letterSpacing: '1px' }}>
          // SEMANTIC VECTOR SEARCH · FAISS
                </div>
                <h1 style={{ fontFamily: 'Epilogue', fontWeight: 900, fontSize: '36px', letterSpacing: '-1.5px' }}>AI Search</h1>
            </div>

            {/* Search Box */}
            <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
                <label>Search in natural language</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <input value={query} onChange={e => setQuery(e.target.value)}
                        placeholder="e.g. React developer with FastAPI and PostgreSQL experience"
                        onKeyDown={e => e.key === 'Enter' && search()}
                        style={{ flex: 1 }} />
                    <button className="btn btn-black" onClick={() => search()} disabled={loading}>
                        {loading ? '...' : '→ Search'}
                    </button>
                </div>

                {/* Examples */}
                <div style={{ marginTop: '12px' }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Try these:</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {EXAMPLES.map(ex => (
                            <button key={ex} onClick={() => { setQuery(ex); search(ex); }}
                                className="btn btn-white" style={{ fontSize: '10px', padding: '4px 10px' }}>
                                {ex}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#999' }}>
                    Searching vector database...
                </div>
            )}

            {searched && !loading && results.length === 0 && (
                <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Epilogue', fontWeight: 900, fontSize: '20px', marginBottom: '8px' }}>No matches found.</div>
                    <p style={{ color: '#999', fontSize: '13px' }}>Try uploading more resumes or a different query.</p>
                </div>
            )}

            {results.length > 0 && !loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#999', letterSpacing: '1px' }}>
            // {results.length} RESULT(S) FOUND
                    </div>
                    {results.map((r, i) => (
                        <div key={r.candidate_id} className="card animate-fade" style={{ padding: '16px 20px', animationDelay: `${i * 0.05}s` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                        <div style={{
                                            width: 36, height: 36, background: 'var(--black)', border: 'var(--border)',
                                            borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontFamily: 'Epilogue', fontWeight: 900, fontSize: '11px', color: 'var(--yellow)',
                                        }}>
                                            {(r.name || 'NA').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                        </div>
                                        <div>
                                            <div style={{ fontFamily: 'Epilogue', fontWeight: 700, fontSize: '15px' }}>{r.name}</div>
                                            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#888' }}>{r.email}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {(r.skills || []).slice(0, 8).map((s: string) => (
                                            <span key={s} className="tag tag-blue">{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <div style={{
                                    background: 'var(--yellow)', border: 'var(--border)', borderRadius: 'var(--radius)',
                                    boxShadow: 'var(--shadow)', padding: '10px 14px', textAlign: 'center', flexShrink: 0, marginLeft: '16px',
                                }}>
                                    <div style={{ fontFamily: 'Epilogue', fontWeight: 900, fontSize: '20px', letterSpacing: '-1px' }}>
                                        {r.similarity_score.toFixed(1)}%
                                    </div>
                                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#555' }}>MATCH</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}