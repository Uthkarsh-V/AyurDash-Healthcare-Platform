// client/src/components/doctor/PatientLookup.jsx
import { useState } from 'react';
import * as api from '../../api';
import { DUMMY_PATIENTS } from '../../data/ayurdb';

const PRIORITY_META = {
  critical: { label: 'Critical', icon: '🚨', bg: '#fee2e2', color: '#991b1b', border: '#f87171' },
  high:     { label: 'High',     icon: '🔴', bg: '#ffedd5', color: '#9a3412', border: '#fdba74' },
  medium:   { label: 'Medium',   icon: '🟡', bg: '#fef9c3', color: '#854d0e', border: '#fde047' },
  low:      { label: 'Stable',   icon: '🟢', bg: '#dcfce7', color: '#166534', border: '#86efac' },
};

export default function PatientLookup() {
  const [query, setQuery]   = useState('');
  const [results, setResults] = useState(DUMMY_PATIENTS);
  const [record, setRecord]   = useState(DUMMY_PATIENTS[0]);
  const [activeTab, setActiveTab] = useState('overview');

  function search(q) {
    setQuery(q);
    if (!q.trim()) {
      setResults(DUMMY_PATIENTS);
      return;
    }
    const lower = q.toLowerCase();
    const filtered = DUMMY_PATIENTS.filter(p =>
      p.display_name?.toLowerCase().includes(lower) ||
      p.email?.toLowerCase().includes(lower) ||
      p.prakriti?.toLowerCase().includes(lower) ||
      p.priority?.toLowerCase().includes(lower) ||
      p.phone?.includes(q) ||
      p.id?.toLowerCase().includes(lower)
    );
    setResults(filtered);
  }

  async function loadFull(id) {
    try {
      const data = await api.getPatientFull(id);
      if (data) {
        setRecord(data);
        setActiveTab('overview');
        return;
      }
    } catch (err) {
      // Offline fallback
    }

    const dummy = DUMMY_PATIENTS.find(p => p.id === id) || DUMMY_PATIENTS[0];
    setRecord({
      ...dummy,
      prescriptions: [
        { medicine_name: 'Ashwagandha Churna', dosage: '5g with warm milk at bedtime', prescribed_at: new Date().toISOString() },
        { medicine_name: 'Triphala Churna', dosage: '3g with warm water before sleep', prescribed_at: new Date(Date.now() - 86400000 * 3).toISOString() }
      ],
      vega_bouts: dummy.bouts_count ? [
        { bout_time: '08:15', bout_number: 1, therapy: 'Virechana', volume: 'large', color: 'dark-green' },
        { bout_time: '09:00', bout_number: 2, therapy: 'Virechana', volume: 'moderate', color: 'yellow-green' },
        { bout_time: '09:45', bout_number: 3, therapy: 'Virechana', volume: 'moderate', color: 'yellow-green' },
        { bout_time: '10:30', bout_number: 4, therapy: 'Virechana', volume: 'small', color: 'clear' },
      ] : []
    });
    setActiveTab('overview');
  }

  return (
    <section className="view">
      <h2 className="view-title">🔍 Clinical Patient Directory & Full EHR Lookup</h2>
      
      <div className="card" style={{ padding: 18, marginBottom: 16 }}>
        <div className="search-bar" style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search patient by name, priority (critical/high), Prakriti, phone, or ID..."
            value={query}
            onChange={e => search(e.target.value)}
            style={{ padding: '10px 14px', fontSize: '0.92rem' }}
          />
          {query && (
            <button
              className="btn btn-outline"
              onClick={() => { setQuery(''); setResults(DUMMY_PATIENTS); }}
              style={{ padding: '8px 14px' }}
            >
              Clear
            </button>
          )}
        </div>

        <div className="patient-search-results mt-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
          {results.map(p => {
            const prio = PRIORITY_META[p.priority || 'medium'] || PRIORITY_META.medium;
            const isSelected = record?.id === p.id;
            return (
              <div
                key={p.id}
                className="patient-item"
                onClick={() => loadFull(p.id)}
                style={{
                  cursor: 'pointer', padding: '10px 14px', borderRadius: 8,
                  border: isSelected ? '2px solid var(--teal)' : '1px solid var(--border)',
                  background: isSelected ? 'var(--teal-pale)' : 'var(--cream)',
                  display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s'
                }}
              >
                <div className="patient-avatar" style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: prio.bg, color: prio.color, border: `1.5px solid ${prio.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800
                }}>
                  {(p.display_name || 'P')[0]?.toUpperCase()}
                </div>
                <div className="patient-info" style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                    <span style={{ fontWeight: 700, color: 'var(--teal)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.display_name}
                    </span>
                    <span style={{
                      fontSize: '0.64rem', fontWeight: 800, padding: '2px 6px', borderRadius: 8,
                      background: prio.bg, color: prio.color, border: `1px solid ${prio.border}`,
                      textTransform: 'uppercase', flexShrink: 0
                    }}>
                      {prio.icon} {prio.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {p.age} yrs • {p.gender || 'Patient'} • {p.prakriti}
                  </div>
                </div>
              </div>
            );
          })}
          {results.length === 0 && <p className="muted" style={{ gridColumn: '1 / -1', padding: 12 }}>No patients matched "{query}".</p>}
        </div>
      </div>

      {record && (
        <div>
          <div className="patient-record-card card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--teal)', fontSize: '1.25rem' }}>
                  📋 Full Clinical Record: {record.display_name}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  ID: {record.id} • Registered Patient Profile
                </span>
              </div>
              {record.priority && (
                <div style={{
                  padding: '4px 12px', borderRadius: 12, fontSize: '0.8rem', fontWeight: 800,
                  background: (PRIORITY_META[record.priority] || PRIORITY_META.medium).bg,
                  color: (PRIORITY_META[record.priority] || PRIORITY_META.medium).color,
                  border: `1.5px solid ${(PRIORITY_META[record.priority] || PRIORITY_META.medium).border}`
                }}>
                  {(PRIORITY_META[record.priority] || PRIORITY_META.medium).icon} Triage Priority: {(PRIORITY_META[record.priority] || PRIORITY_META.medium).label.toUpperCase()}
                </div>
              )}
            </div>

            <div className="record-tabs" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {['overview', 'prescriptions', 'vega_bouts'].map(tab => (
                <button
                  key={tab}
                  className={`record-tab${activeTab === tab ? ' active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer',
                    border: activeTab === tab ? '1.5px solid var(--teal)' : '1px solid var(--border)',
                    background: activeTab === tab ? 'var(--teal)' : 'var(--cream)',
                    color: activeTab === tab ? '#fff' : 'var(--text-muted)'
                  }}
                >
                  {tab === 'overview' ? '🩺 Clinical Overview' : tab === 'prescriptions' ? '💊 Prescriptions' : '📊 Panchakarma / Vega Bouts'}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="record-panel active" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                <div style={{ padding: 12, borderRadius: 8, background: 'var(--cream)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Demographics</div>
                  <div style={{ marginTop: 6, fontSize: '0.88rem' }}><strong>Age / Gender:</strong> {record.age} yrs • {record.gender || 'Not specified'}</div>
                  <div style={{ marginTop: 4, fontSize: '0.88rem' }}><strong>Blood Group:</strong> {record.blood_group || 'O+'}</div>
                  <div style={{ marginTop: 4, fontSize: '0.88rem' }}><strong>Contact Phone:</strong> {record.phone || 'N/A'}</div>
                  <div style={{ marginTop: 4, fontSize: '0.88rem' }}><strong>Email:</strong> {record.email || 'N/A'}</div>
                </div>

                <div style={{ padding: 12, borderRadius: 8, background: 'var(--cream)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Ayurvedic Constitution (Prakriti)</div>
                  <div style={{ marginTop: 6, fontSize: '1.05rem', fontWeight: 800, color: 'var(--teal)' }}>🌿 {record.prakriti || 'Tridosha'}</div>
                  <div style={{ marginTop: 8, fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span>Vata:</span> <strong>{record.dosha_vata ?? 33}%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span>Pitta:</span> <strong>{record.dosha_pitta ?? 33}%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Kapha:</span> <strong>{record.dosha_kapha ?? 34}%</strong>
                    </div>
                  </div>
                </div>

                <div style={{ padding: 12, borderRadius: 8, background: 'var(--cream)', border: '1px solid var(--border)', gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Allergies & Contraindications</div>
                  <div style={{ marginTop: 6, fontSize: '0.88rem' }}>
                    {Array.isArray(record.allergies) && record.allergies.length > 0 ? (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                        {record.allergies.map((a, i) => (
                          <span key={i} style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700 }}>
                            ⚠️ {a}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#059669', fontSize: '0.85rem' }}>✅ No known drug or diet allergies recorded.</span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginTop: 12 }}>Physician Clinical Notes</div>
                  <div style={{ marginTop: 6, fontSize: '0.88rem', fontStyle: 'italic', color: '#374151', background: '#fff', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)' }}>
                    "{record.mental_health || 'Patient vitals stable. Under active Ayurvedic monitoring and chronotherapy schedule.'}"
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'prescriptions' && (
              <div className="record-panel active">
                {record.prescriptions?.length ? (
                  record.prescriptions.map((rx, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--cream)', borderRadius: 8, marginBottom: 8, border: '1px solid var(--border)' }}>
                      <div>
                        <strong style={{ color: 'var(--teal)' }}>💊 {rx.medicine_name}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{rx.dosage}</div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(rx.prescribed_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="muted">No active prescriptions.</p>
                )}
              </div>
            )}

            {activeTab === 'vega_bouts' && (
              <div className="record-panel active">
                {record.vega_bouts?.length ? (
                  record.vega_bouts.map((b, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--cream)', borderRadius: 6, marginBottom: 6, border: '1px solid var(--border)' }}>
                      <span style={{ fontWeight: 700 }}>Bout #{b.bout_number}</span>
                      <span style={{ fontSize: '0.84rem' }}>{b.therapy} • {b.volume} volume • {b.color}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.bout_time}</span>
                    </div>
                  ))
                ) : (
                  <p className="muted">No recent Panchakarma vega bouts recorded for this patient.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

