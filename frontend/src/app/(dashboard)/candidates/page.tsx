'use client';
import { useEffect, useState } from 'react';
import { jobsAPI, resumeAPI } from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CandidatesContent() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [ranked, setRanked] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    jobsAPI.getAll().then(r => {
      setJobs(r.data);
      const jobId = searchParams.get('job');
      if (jobId) rankCandidates(parseInt(jobId));
    });
  }, []);

  const rankCandidates = async (jobId: number) => {
    setLoading(true);
    setSelectedJob(jobId);
    try {
      const res = await jobsAPI.rankCandidates(jobId);
      setRanked(res.data.ranked_candidates);
    } finally { setLoading(false); }
  };

  const deleteCandidate = async (id: number) => {
    if (!confirm('Delete this candidate?')) return;
    setDeleting(id);
    try {
      await resumeAPI.delete(id);
      setRanked(prev => prev.filter(r => r.candidate_id !== id));
    } finally { setDeleting(null); }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'var(--green)';
    if (score >= 45) return 'var(--yellow)';
    return 'var(--red)';
  };

  return (
    <div style={{ maxWidth: '960px' }} className="animate-fade">

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{
          fontFamily: 'JetBrains Mono', fontSize: '10px',
          color: '#999', marginBottom: '6px', letterSpacing: '1px',
        }}>
          // AI RANKING ENGINE
        </div>
        <h1 style={{
          fontFamily: 'Epilogue', fontWeight: 900,
          fontSize: '36px', letterSpacing: '-1.5px',
        }}>
          Candidates
        </h1>
      </div>

      {/* Job Selector */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <label>Select Job to Rank Against</label>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
          {jobs.map(job => (
            <button key={job.id} onClick={() => rankCandidates(job.id)}
              className={`btn ${selectedJob === job.id ? 'btn-black' : 'btn-white'}`}
              style={{ fontSize: '12px' }}>
              {selectedJob === job.id ? '▶' : '○'} {job.title}
            </button>
          ))}
          {jobs.length === 0 && (
            <p style={{ fontSize: '13px', color: '#999' }}>
              No jobs yet. <a href="/jobs" style={{ color: 'var(--blue)', fontWeight: 700 }}>Create one →</a>
            </p>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{
          textAlign: 'center', padding: '40px',
          fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#999',
        }}>
          AI ranking in progress...
        </div>
      )}

      {/* Ranked Results */}
      {ranked.length > 0 && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {ranked.map((r, i) => (
            <div key={r.candidate_id} className="card" style={{ padding: '0', overflow: 'hidden' }}>

              {/* Rank Banner */}
              <div style={{
                background: i === 0 ? 'var(--yellow)' : i === 1 ? 'var(--black)' : 'var(--white)',
                borderBottom: 'var(--border)', padding: '8px 16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{
                  fontFamily: 'Epilogue', fontWeight: 900, fontSize: '12px',
                  textTransform: 'uppercase', letterSpacing: '1px',
                  color: i === 1 ? 'var(--yellow)' : 'var(--black)',
                }}>
                  {i === 0 ? '🏆 Top Match' : i === 1 ? '⭐ Runner Up' : `#${r.rank} Ranked`}
                </span>
                <span style={{
                  fontFamily: 'JetBrains Mono', fontSize: '10px',
                  color: i === 1 ? '#888' : '#555',
                }}>Rank #{r.rank}</span>
              </div>

              <div style={{ padding: '16px 20px' }}>
                <div className="candidate-card-inner" style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                }}>
                  <div style={{ flex: 1 }}>

                    {/* Name + Email */}
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      gap: '10px', marginBottom: '10px',
                    }}>
                      <div style={{
                        width: 40, height: 40, background: 'var(--black)',
                        borderRadius: 'var(--radius)', border: 'var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Epilogue', fontWeight: 900, fontSize: '12px',
                        color: 'var(--yellow)', flexShrink: 0,
                      }}>
                        {(r.name || 'NA').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontFamily: 'Epilogue', fontWeight: 700, fontSize: '16px' }}>
                          {r.name}
                        </div>
                        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#888' }}>
                          {r.email}
                        </div>
                      </div>
                    </div>

                    {/* Score Bars */}
                    <div className="score-bars" style={{
                      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '10px', marginBottom: '12px',
                    }}>
                      {[
                        { label: 'Skills', val: r.skills_score },
                        { label: 'Experience', val: r.experience_score },
                        { label: 'Semantic', val: r.semantic_score },
                      ].map(({ label, val }) => (
                        <div key={label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{
                              fontFamily: 'JetBrains Mono', fontSize: '9px',
                              color: '#999', textTransform: 'uppercase',
                            }}>{label}</span>
                            <span style={{
                              fontFamily: 'JetBrains Mono',
                              fontSize: '9px', fontWeight: 700,
                            }}>{val}%</span>
                          </div>
                          <div style={{
                            height: '6px', background: '#eee',
                            border: '1px solid #ddd', borderRadius: '2px', overflow: 'hidden',
                          }}>
                            <div style={{
                              height: '100%', width: `${val}%`,
                              background: getScoreColor(val), transition: 'width 0.5s ease',
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Matched Skills */}
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {(r.matched_skills || []).map((s: string) => (
                        <span key={s} className="tag tag-blue">{s}</span>
                      ))}
                    </div>
                  </div>

                  {/* ATS Score Box */}
                  <div className="ats-score-box" style={{
                    textAlign: 'center', marginLeft: '20px', flexShrink: 0,
                  }}>
                    <div style={{
                      width: 80, height: 80, border: 'var(--border)',
                      borderRadius: 'var(--radius)', background: getScoreColor(r.ats_score),
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      boxShadow: 'var(--shadow)',
                    }}>
                      <div style={{
                        fontFamily: 'Epilogue', fontWeight: 900,
                        fontSize: '22px', letterSpacing: '-1px', lineHeight: 1,
                      }}>
                        {r.ats_score}
                      </div>
                      <div style={{
                        fontFamily: 'JetBrains Mono', fontSize: '8px',
                        opacity: 0.7, marginTop: '2px',
                      }}>ATS SCORE</div>
                    </div>
                    <button onClick={() => deleteCandidate(r.candidate_id)}
                      className="btn btn-white"
                      style={{ fontSize: '10px', marginTop: '8px', padding: '4px 8px' }}>
                      {deleting === r.candidate_id ? '...' : '✕ Remove'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && ranked.length === 0 && selectedJob && (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{
            fontFamily: 'Epilogue', fontWeight: 900,
            fontSize: '20px', marginBottom: '8px',
          }}>No candidates found.</div>
          <a href="/upload" className="btn btn-yellow">Upload Resumes →</a>
        </div>
      )}
    </div>
  );
}

export default function CandidatesPage() {
  return (
    <Suspense fallback={
      <div style={{
        fontFamily: 'JetBrains Mono', fontSize: '12px',
        color: '#999', padding: '40px',
      }}>Loading...</div>
    }>
      <CandidatesContent />
    </Suspense>
  );
}
