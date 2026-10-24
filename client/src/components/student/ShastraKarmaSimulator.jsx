// client/src/components/student/ShastraKarmaSimulator.jsx
import React, { useState, useEffect, useRef } from 'react';
import ShastraKarmaRenderer from '../../renderbit/ShastraKarmaRenderer';
import AiGuider from './AiGuider';

const KARMAS = [
  {
    id: 'chedana',
    name: 'Chedana (Excision)',
    instrument: 'Vriddhipatra / Mandalgra',
    target: 'Pumpkin / Ash Gourd (Pushpaphala)',
    description: 'Clean, continuous linear excision across the equatorial meridian without jagged margins.'
  },
  {
    id: 'bhedana',
    name: 'Bhedana (Incision & Drainage)',
    instrument: 'Kushapatra / Nakhashastra',
    target: 'Water bladder (Basti / Druti)',
    description: 'Instant puncture at the inferior dependent pole to evacuate purulent fluid by gravity.'
  },
  {
    id: 'lekhana',
    name: 'Lekhana (Scraping & Debridement)',
    instrument: 'Mandalagra (Round Blade)',
    target: 'Hairy skin (Savyoma charma)',
    description: 'Superficial parallel sweeps at a 30° angle to debride devitalized layers without dermal tears.'
  },
  {
    id: 'vyadhana',
    name: 'Vyadhana (Puncturing / Sira Vedha)',
    instrument: 'Kutharika / Vrihimukha',
    target: 'Vein (Sira) / Lotus Stalk',
    description: 'Centred single vascular lumen penetration without posterior wall transfixion (Dvi-khandita).'
  },
];

export default function ShastraKarmaSimulator() {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const [activeKarma, setActiveKarma] = useState('chedana');
  const [showGuides, setShowGuides] = useState(true);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [attemptHistory, setAttemptHistory] = useState([]);
  const [evalModalOpen, setEvalModalOpen] = useState(false);

  useEffect(() => {
    if (canvasRef.current && !rendererRef.current) {
      const canvas = canvasRef.current;
      canvas.width = 800;
      canvas.height = 540;
      const renderer = new ShastraKarmaRenderer(canvas);
      rendererRef.current = renderer;
      renderer.update({ karma: activeKarma, showGuides });
    }

    return () => {
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.update({ karma: activeKarma, showGuides });
    }
    setEvaluationResult(null);
  }, [activeKarma, showGuides]);

  const handleEvaluate = () => {
    if (!rendererRef.current) return;
    const result = rendererRef.current.evaluateKarma();
    setEvaluationResult(result);
    setEvalModalOpen(true);

    if (result.hasAttempted) {
      setAttemptHistory(prev => [
        {
          id: Date.now(),
          karma: result.karma,
          score: result.overallScore,
          grade: result.grade,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev.slice(0, 5)
      ]);
    }
  };

  const handleClear = () => {
    if (rendererRef.current) {
      rendererRef.current.reset();
    }
    setEvaluationResult(null);
    setEvalModalOpen(false);
  };

  return (
    <div className="view" id="view-shastrakarma">
      {/* View Header */}
      <div className="view-header" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, color: 'var(--teal)' }}>
              <span>🔪</span> Ashta Vidha Shastra Karma Surgical Simulator
            </h2>
            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Master Sushruta Samhita's 8 classical surgical procedures on authentic proxy tissues with real-time biometric telemetry and automated mentorship.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', cursor: 'pointer', background: 'var(--cream)', padding: '6px 12px', borderRadius: 20, border: '1px solid var(--border)' }}>
              <input
                type="checkbox"
                checked={showGuides}
                onChange={e => setShowGuides(e.target.checked)}
              />
              <span style={{ fontWeight: 600, color: 'var(--teal)' }}>📐 Surgical Axis Guides</span>
            </label>
          </div>
        </div>
      </div>

      <div className="view-body" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
        {/* Left Column: Karma Selector & Instructions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 16 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '1rem', color: 'var(--teal)' }}>Select Surgical Karma</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {KARMAS.map(k => {
                const isSelected = activeKarma === k.id;
                return (
                  <button
                    key={k.id}
                    onClick={() => {
                      setActiveKarma(k.id);
                      handleClear();
                    }}
                    style={{
                      padding: '12px 14px', textAlign: 'left',
                      background: isSelected ? 'var(--teal)' : 'var(--cream)',
                      color: isSelected ? '#fff' : 'var(--text)',
                      border: isSelected ? '1.5px solid var(--teal)' : '1px solid var(--border)',
                      borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{k.name}</div>
                    <div style={{ fontSize: '0.75rem', opacity: isSelected ? 0.9 : 0.7, marginTop: 2 }}>
                      Proxy: <strong>{k.target}</strong>
                    </div>
                    <div style={{ fontSize: '0.72rem', opacity: isSelected ? 0.85 : 0.6, marginTop: 2 }}>
                      Shastra: {k.instrument}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Technique Instruction Card */}
          <div className="card" style={{ padding: 16 }}>
            <h4 style={{ margin: '0 0 8px', color: 'var(--teal)', fontSize: '0.92rem' }}>Technique Guidance</h4>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {KARMAS.find(k => k.id === activeKarma)?.description}
            </p>
            <div style={{ marginTop: 12, padding: '8px 10px', background: 'var(--cream)', borderRadius: 6, fontSize: '0.78rem', color: 'var(--teal)', fontWeight: 600 }}>
              💡 Practice with mouse drag or finger touch on screen. Click "Evaluate Technique" below when finished.
            </div>
          </div>

          {/* AI Surgical Mentor Assistant */}
          <AiGuider
            title="Sushruta AI Surgical Mentor"
            guidelines={
              activeKarma === 'chedana' ? "Chedana requires an uninterrupted, continuous sweep. Pull the blade from left to right along the equatorial axis. Anchor your hypothenar palm to dampen physiological hand tremor." :
              activeKarma === 'bhedana' ? "Bhedana requires gravity-assisted evacuation. Tap decisively on the dependent apex (inferior pole) of the Basti to ensure spontaneous and complete fluid outflow." :
              activeKarma === 'lekhana' ? "Lekhana debridement is achieved through light, rapid, parallel sweeps with the curved Mandalagra shastra. Never gouge deep into dermis." :
              "Vyadhana requires pinpoint axial vascular entry. Center your touch precisely on the dark red lumen core and avoid piercing through the posterior wall."
            }
          />
        </div>

        {/* Right Column: Surgical Canvas & Control Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Canvas Card */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', border: '2px solid var(--border)', position: 'relative' }}>
            <canvas
              ref={canvasRef}
              style={{
                width: '100%',
                height: '500px',
                display: 'block',
                cursor: 'crosshair',
                touchAction: 'none',
                background: '#0f172a'
              }}
            />

            {/* Quick Canvas Overlay Bar */}
            <div style={{
              position: 'absolute', bottom: 14, left: 16, right: 16,
              background: 'rgba(15, 23, 42, 0.88)', backdropFilter: 'blur(6px)',
              padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>
                  Tool: <strong style={{ color: '#38bdf8' }}>{KARMAS.find(k => k.id === activeKarma)?.instrument}</strong>
                </span>
                <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>•</span>
                <span style={{ fontSize: '0.82rem', color: '#a7f3d0' }}>
                  Target: {KARMAS.find(k => k.id === activeKarma)?.target}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={handleClear}
                  style={{
                    padding: '7px 14px', background: 'rgba(255,255,255,0.1)', color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, cursor: 'pointer',
                    fontSize: '0.82rem', fontWeight: 600
                  }}
                >
                  🔄 Clear Proxy
                </button>

                <button
                  type="button"
                  onClick={handleEvaluate}
                  style={{
                    padding: '7px 18px', background: '#2563eb', color: '#fff',
                    border: 'none', borderRadius: 6, cursor: 'pointer',
                    fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
                    boxShadow: '0 4px 14px rgba(37,99,235,0.4)'
                  }}
                >
                  <span>📊</span> Complete & Evaluate Technique
                </button>
              </div>
            </div>
          </div>

          {/* Quick Attempt History Strip */}
          {attemptHistory.length > 0 && (
            <div className="card" style={{ padding: '12px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Recent Surgical Attempts
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--teal)', fontWeight: 600 }}>
                  Tracking Self-Improvement
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                {attemptHistory.map((att, i) => (
                  <div
                    key={att.id}
                    style={{
                      padding: '8px 12px', background: 'var(--cream)', borderRadius: 8,
                      border: '1px solid var(--border)', minWidth: 150
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: att.score >= 75 ? 'var(--green)' : 'var(--saffron)' }}>
                        {att.score}%
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{att.time}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--teal)', marginTop: 2 }}>
                      {att.karma}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── SURGICAL EVALUATION & IMPROVISATION MODAL ── */}
      {evalModalOpen && evaluationResult && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(10, 25, 20, 0.72)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            background: 'var(--white)', borderRadius: 14, maxWidth: 680, width: '100%',
            maxHeight: '92vh', overflowY: 'auto', border: '1.5px solid var(--border)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.35)', position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px', borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'linear-gradient(135deg, var(--cream) 0%, #fff 100%)'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--teal)', background: 'var(--teal-pale)', padding: '2px 8px', borderRadius: 8 }}>
                  Sushruta Surgical Evaluation Report
                </span>
                <h3 style={{ margin: '6px 0 0', fontSize: '1.25rem', color: 'var(--teal)' }}>
                  {evaluationResult.karma || 'Surgical Assessment'}
                </h3>
              </div>
              <button
                onClick={() => setEvalModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {!evaluationResult.hasAttempted ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
                  <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 8 }}>⚠️</span>
                  <h4 style={{ margin: 0, color: 'var(--teal)' }}>{evaluationResult.grade}</h4>
                  <p style={{ marginTop: 6, fontSize: '0.9rem' }}>{evaluationResult.message}</p>
                </div>
              ) : (
                <>
                  {/* Score Hero */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 20px', borderRadius: 12,
                    background: evaluationResult.overallScore >= 75 ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                    border: evaluationResult.overallScore >= 75 ? '1.5px solid #86efac' : '1.5px solid #fde68a'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800, color: evaluationResult.overallScore >= 75 ? '#166534' : '#92400e' }}>
                        Technique Assessment Grade
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: evaluationResult.overallScore >= 75 ? '#15803d' : '#b45309', marginTop: 2 }}>
                        {evaluationResult.grade}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#4b5563', marginTop: 4 }}>
                        Proxy Medium: <strong>{evaluationResult.object}</strong>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        width: 76, height: 76, borderRadius: '50%',
                        background: '#fff', border: '4px solid',
                        borderColor: evaluationResult.overallScore >= 75 ? '#22c55e' : '#f59e0b',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.6rem', fontWeight: 900,
                        color: evaluationResult.overallScore >= 75 ? '#15803d' : '#b45309',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                      }}>
                        {evaluationResult.overallScore}%
                      </div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: 4 }}>SCORE</div>
                    </div>
                  </div>

                  {/* Criteria Telemetry Breakdown */}
                  {evaluationResult.metrics && (
                    <div>
                      <h4 style={{ margin: '0 0 10px', fontSize: '0.92rem', color: 'var(--teal)' }}>
                        Detailed Surgical Dimensions
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {evaluationResult.metrics.precisionScore !== undefined && (
                          <div style={{ background: 'var(--cream)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700 }}>
                              <span>🎯 Trajectory Precision</span>
                              <span>{evaluationResult.metrics.precisionScore}%</span>
                            </div>
                            <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, marginTop: 6, overflow: 'hidden' }}>
                              <div style={{ width: `${evaluationResult.metrics.precisionScore}%`, height: '100%', background: 'var(--teal)' }} />
                            </div>
                          </div>
                        )}

                        {evaluationResult.metrics.stabilityScore !== undefined && (
                          <div style={{ background: 'var(--cream)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700 }}>
                              <span>🧘 Hand Stability & Tremor</span>
                              <span>{evaluationResult.metrics.stabilityScore}%</span>
                            </div>
                            <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, marginTop: 6, overflow: 'hidden' }}>
                              <div style={{ width: `${evaluationResult.metrics.stabilityScore}%`, height: '100%', background: 'var(--green)' }} />
                            </div>
                          </div>
                        )}

                        {evaluationResult.metrics.lengthScore !== undefined && (
                          <div style={{ background: 'var(--cream)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700 }}>
                              <span>📏 Incision Margin Adequacy</span>
                              <span>{evaluationResult.metrics.lengthScore}%</span>
                            </div>
                            <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, marginTop: 6, overflow: 'hidden' }}>
                              <div style={{ width: `${evaluationResult.metrics.lengthScore}%`, height: '100%', background: 'var(--saffron)' }} />
                            </div>
                          </div>
                        )}

                        {evaluationResult.metrics.cadenceScore !== undefined && (
                          <div style={{ background: 'var(--cream)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700 }}>
                              <span>⏱ Cadence & Speed Control</span>
                              <span>{evaluationResult.metrics.cadenceScore}%</span>
                            </div>
                            <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, marginTop: 6, overflow: 'hidden' }}>
                              <div style={{ width: `${evaluationResult.metrics.cadenceScore}%`, height: '100%', background: '#8b5cf6' }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* AI FEEDBACK & ACTIONABLE IMPROVISATION SUGGESTIONS */}
                  <div>
                    <h4 style={{ margin: '0 0 10px', fontSize: '0.96rem', color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>💡</span> Tutor Suggestions for Technique Improvisation
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {evaluationResult.suggestions?.map((sug, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '14px 16px', borderRadius: 10,
                            background: '#f8fafc', border: '1.5px solid #e2e8f0',
                            borderLeft: '4px solid var(--teal)'
                          }}
                        >
                          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--teal)' }}>
                            {sug.criterion}
                          </div>
                          <div style={{ fontSize: '0.84rem', color: '#dc2626', fontWeight: 600, marginTop: 4 }}>
                            ⚠️ Observed Defect: {sug.issue}
                          </div>
                          <div style={{ fontSize: '0.86rem', color: '#1e293b', marginTop: 6, lineHeight: 1.45, background: '#fff', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                            <strong style={{ color: '#0f766e' }}>🔧 How to Improvise:</strong> {sug.fix}
                          </div>
                          {sug.shastraRef && (
                            <div style={{ fontSize: '0.76rem', color: '#64748b', fontStyle: 'italic', marginTop: 6 }}>
                              📜 {sug.shastraRef}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px', borderTop: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'var(--cream)', borderBottomLeftRadius: 14, borderBottomRightRadius: 14
            }}>
              <button
                onClick={() => setEvalModalOpen(false)}
                style={{
                  padding: '8px 18px', background: 'transparent', border: '1.5px solid var(--border)',
                  borderRadius: 8, cursor: 'pointer', fontWeight: 600, color: 'var(--text-muted)'
                }}
              >
                Close Report
              </button>

              <button
                onClick={handleClear}
                style={{
                  padding: '9px 22px', background: 'var(--teal)', color: '#fff',
                  border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(45,106,79,0.3)'
                }}
              >
                <span>🔄</span> Retake & Improvise Technique
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
