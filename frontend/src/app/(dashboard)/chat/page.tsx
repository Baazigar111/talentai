'use client';
import { useState, useRef, useEffect } from 'react';
import { aiAPI } from '@/lib/api';

interface Message {
    role: 'user' | 'ai';
    text: string;
    candidates?: any[];
    powered_by?: string;
}

const SUGGESTIONS = [
    'Who is best for backend engineer role?',
    'Find Python developers',
    'Show all candidates',
    'Find React developers',
    'Who has LangChain experience?',
    'Compare all candidates',
];

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'ai',
            text: "Hey! I'm your AI recruiter assistant powered by Ollama. Ask me anything about your candidates — I can find, rank, and compare them intelligently.",
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [ollamaStatus, setOllamaStatus] = useState<string>('Checking...');
    const [ollamaActive, setOllamaActive] = useState<boolean | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        aiAPI.status()
            .then(r => {
                setOllamaActive(r.data.ollama);
                setOllamaStatus(r.data.ollama
                    ? `Ollama Active · ${r.data.models?.[0] || 'llama3.2'}`
                    : 'Rule-based Mode'
                );
            })
            .catch(() => {
                setOllamaActive(false);
                setOllamaStatus('Backend Offline');
            });
    }, []);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = async (msg?: string) => {
        const text = msg || input.trim();
        if (!text || loading) return;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text }]);
        setLoading(true);
        try {
            const res = await aiAPI.chat(text);
            setMessages(prev => [...prev, {
                role: 'ai',
                text: res.data.response,
                candidates: res.data.candidates,
                powered_by: res.data.powered_by,
            }]);
        } catch (e) {
            setMessages(prev => [...prev, {
                role: 'ai',
                text: 'Something went wrong. Make sure the backend is running.',
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            maxWidth: '800px',
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 64px)',
        }} className="animate-fade">

            {/* Header */}
            <div style={{ marginBottom: '16px', flexShrink: 0 }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    fontFamily: 'JetBrains Mono', fontSize: '10px',
                    color: '#999', marginBottom: '6px', letterSpacing: '1px',
                }}>
                    <span>// AI RECRUITER ASSISTANT</span>
                    <span style={{
                        background: ollamaActive === true ? 'var(--green)' :
                            ollamaActive === false ? 'var(--yellow)' : '#eee',
                        color: 'var(--black)',
                        border: 'var(--border)', borderRadius: 'var(--radius)',
                        padding: '2px 8px', fontSize: '9px', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>
                        {ollamaActive === true ? '● ' : '○ '}{ollamaStatus}
                    </span>
                </div>
                <h1 style={{
                    fontFamily: 'Epilogue', fontWeight: 900,
                    fontSize: '36px', letterSpacing: '-1.5px',
                }}>
                    AI Chat
                </h1>
            </div>

            {/* Ollama info banner */}
            {ollamaActive === false && (
                <div style={{
                    background: 'var(--yellow)', border: 'var(--border)',
                    borderRadius: 'var(--radius)', padding: '10px 14px',
                    marginBottom: '12px', flexShrink: 0,
                    fontFamily: 'JetBrains Mono', fontSize: '10px', fontWeight: 700,
                    boxShadow: 'var(--shadow)',
                }}>
                    ○ Ollama not detected — using smart rule-based fallback.
                    Run <code style={{ background: 'rgba(0,0,0,0.1)', padding: '1px 5px', borderRadius: 3 }}>ollama pull llama3.2</code> to enable full AI.
                </div>
            )}

            {ollamaActive === true && (
                <div style={{
                    background: 'var(--green)', border: 'var(--border)',
                    borderRadius: 'var(--radius)', padding: '10px 14px',
                    marginBottom: '12px', flexShrink: 0,
                    fontFamily: 'JetBrains Mono', fontSize: '10px', fontWeight: 700,
                    boxShadow: 'var(--shadow)',
                }}>
                    ● Ollama AI active — full LLM-powered responses enabled.
                </div>
            )}

            {/* Messages */}
            <div style={{
                flex: 1, overflowY: 'auto',
                display: 'flex', flexDirection: 'column',
                gap: '14px', paddingBottom: '12px',
            }}>
                {messages.map((msg, i) => (
                    <div key={i}
                        style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
                        className="animate-fade"
                    >
                        <div style={{ maxWidth: '78%' }}>
                            {/* Sender label */}
                            <div style={{
                                fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#999',
                                marginBottom: '4px', letterSpacing: '1px', textTransform: 'uppercase',
                                textAlign: msg.role === 'user' ? 'right' : 'left',
                                display: 'flex', alignItems: 'center',
                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                gap: '6px',
                            }}>
                                {msg.role === 'user' ? 'You' : 'AI Assistant'}
                                {msg.powered_by && (
                                    <span style={{
                                        background: 'var(--green)', color: 'var(--black)',
                                        border: '1px solid var(--black)', borderRadius: 'var(--radius)',
                                        padding: '1px 6px', fontSize: '8px', fontWeight: 700,
                                    }}>
                                        {msg.powered_by}
                                    </span>
                                )}
                            </div>

                            {/* Bubble */}
                            <div style={{
                                background: msg.role === 'user' ? 'var(--black)' : 'white',
                                color: msg.role === 'user' ? 'white' : 'var(--black)',
                                border: 'var(--border)', borderRadius: 'var(--radius)',
                                padding: '12px 16px', boxShadow: 'var(--shadow)',
                                fontFamily: 'Epilogue', fontSize: '14px', lineHeight: 1.7,
                                whiteSpace: 'pre-wrap',
                            }}>
                                {msg.text}
                            </div>

                            {/* Candidate cards */}
                            {msg.candidates && msg.candidates.length > 0 && (
                                <div style={{
                                    display: 'flex', flexDirection: 'column',
                                    gap: '6px', marginTop: '8px',
                                }}>
                                    {msg.candidates.map((c: any) => (
                                        <div key={c.id} style={{
                                            background: 'var(--yellow)', border: 'var(--border)',
                                            borderRadius: 'var(--radius)', padding: '12px 14px',
                                            boxShadow: 'var(--shadow)',
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <div style={{ fontFamily: 'Epilogue', fontWeight: 900, fontSize: '14px' }}>
                                                        {c.name}
                                                    </div>
                                                    {c.email && (
                                                        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#555', marginTop: '2px' }}>
                                                            {c.email}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="tag tag-black" style={{ fontSize: '9px' }}>
                                                    ID #{c.id}
                                                </span>
                                            </div>
                                            {c.skills && (
                                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
                                                    {c.skills.slice(0, 6).map((s: string) => (
                                                        <span key={s} className="tag tag-black" style={{ fontSize: '9px' }}>{s}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{
                            background: 'white', border: 'var(--border)',
                            borderRadius: 'var(--radius)', padding: '12px 16px',
                            boxShadow: 'var(--shadow)', display: 'flex', gap: '6px', alignItems: 'center',
                        }}>
                            {[0, 1, 2].map(i => (
                                <div key={i} style={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: 'var(--black)',
                                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                                }} />
                            ))}
                            <style>{`
                @keyframes pulse {
                  0%, 100% { opacity: 0.2; transform: scale(0.8); }
                  50% { opacity: 1; transform: scale(1.2); }
                }
              `}</style>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Suggestions — only show at start */}
            {messages.length <= 1 && (
                <div style={{
                    display: 'flex', gap: '6px', flexWrap: 'wrap',
                    marginBottom: '10px', flexShrink: 0,
                }}>
                    {SUGGESTIONS.map(s => (
                        <button key={s} onClick={() => send(s)}
                            className="btn btn-white"
                            style={{ fontSize: '10px', padding: '5px 10px', textTransform: 'none' }}>
                            {s}
                        </button>
                    ))}
                </div>
            )}

            {/* Input bar */}
            <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                    placeholder={ollamaActive ? 'Ask Ollama AI anything about your candidates...' : 'Ask about your candidates...'}
                    style={{ flex: 1 }}
                />
                <button
                    className="btn btn-black"
                    onClick={() => send()}
                    disabled={loading || !input.trim()}
                    style={{ opacity: loading || !input.trim() ? 0.5 : 1 }}
                >
                    → Send
                </button>
            </div>
        </div>
    );
}