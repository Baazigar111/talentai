'use client';
import { useState, useRef } from 'react';
import { resumeAPI } from '@/lib/api';

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true); setError(''); setResult(null);
        try {
            const res = await resumeAPI.upload(file);
            setResult(res.data);
        } catch (e: any) {
            setError(e.response?.data?.detail || 'Upload failed');
        } finally { setLoading(false); }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f && (f.name.endsWith('.pdf') || f.name.endsWith('.docx'))) setFile(f);
    };

    return (
        <div style={{ maxWidth: '700px' }} className="animate-fade">
            <div style={{ marginBottom: '28px' }}>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#999', marginBottom: '6px', letterSpacing: '1px' }}>
          // RESUME PARSER + AI EMBEDDINGS
                </div>
                <h1 style={{ fontFamily: 'Epilogue', fontWeight: 900, fontSize: '36px', letterSpacing: '-1.5px' }}>Upload Resume</h1>
            </div>

            {/* Drop Zone */}
            <div onClick={() => inputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                style={{
                    border: `3px dashed ${dragging ? 'var(--blue)' : 'var(--black)'}`,
                    borderRadius: 'var(--radius)', padding: '48px',
                    textAlign: 'center', cursor: 'pointer',
                    background: dragging ? '#eff6ff' : file ? '#f0fdf4' : 'white',
                    transition: 'all 0.15s', marginBottom: '16px',
                    boxShadow: dragging ? '4px 4px 0 var(--blue)' : 'var(--shadow)',
                }}>
                <input ref={inputRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }}
                    onChange={e => setFile(e.target.files?.[0] || null)} />
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>{file ? '✅' : '📄'}</div>
                <div style={{ fontFamily: 'Epilogue', fontWeight: 900, fontSize: '18px', marginBottom: '6px' }}>
                    {file ? file.name : 'Drop resume here or click to browse'}
                </div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#999' }}>
                    {file ? `${(file.size / 1024).toFixed(0)} KB · ${file.name.split('.').pop()?.toUpperCase()}` : 'Supports PDF and DOCX · Max 5MB'}
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                <button className="btn btn-black" onClick={handleUpload} disabled={!file || loading}
                    style={{ flex: 1, justifyContent: 'center', opacity: !file ? 0.5 : 1 }}>
                    {loading ? 'Parsing with AI...' : '→ Parse & Index Resume'}
                </button>
                {file && <button className="btn btn-white" onClick={() => { setFile(null); setResult(null); }}>Clear</button>}
            </div>

            {error && (
                <div style={{ background: 'var(--red)', color: 'white', padding: '12px 16px', border: 'var(--border)', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '13px', marginBottom: '16px' }}>
                    ✕ {error}
                </div>
            )}

            {/* Result */}
            {result && (
                <div className="animate-fade">
                    <div style={{ background: 'var(--green)', border: 'var(--border)', borderRadius: 'var(--radius)', padding: '12px 16px', fontFamily: 'Epilogue', fontWeight: 900, fontSize: '14px', marginBottom: '16px', boxShadow: 'var(--shadow)' }}>
                        ✓ Resume parsed and indexed successfully!
                    </div>

                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ background: 'var(--black)', padding: '12px 20px', fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#888', letterSpacing: '1px' }}>
              // EXTRACTED DATA · CANDIDATE ID #{result.id}
                        </div>
                        <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            {[
                                { label: 'Full Name', value: result.name },
                                { label: 'Email', value: result.email },
                                { label: 'Phone', value: result.phone },
                                { label: 'Experience', value: `${result.experience_years} years` },
                            ].map(({ label, value }) => (
                                <div key={label}>
                                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{label}</div>
                                    <div style={{ fontFamily: 'Epilogue', fontWeight: 700, fontSize: '14px' }}>{value || '—'}</div>
                                </div>
                            ))}

                            <div style={{ gridColumn: '1/-1' }}>
                                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Detected Skills ({result.skills?.length})</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                    {result.skills?.map((s: string) => <span key={s} className="tag tag-blue">{s}</span>)}
                                </div>
                            </div>

                            <div style={{ gridColumn: '1/-1' }}>
                                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Education</div>
                                {result.education?.map((e: string, i: number) => (
                                    <div key={i} style={{ fontFamily: 'Epilogue', fontSize: '13px', padding: '8px', background: 'var(--yellow)', border: 'var(--border)', borderRadius: 'var(--radius)', marginBottom: '4px' }}>{e}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}