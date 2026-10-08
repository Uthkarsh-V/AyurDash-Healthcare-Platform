// client/src/components/doctor/PatientLookup.jsx
import { useState } from 'react';
import * as api from '../../api';

export default function PatientLookup() {
  const [query, setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [record, setRecord]   = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  async function search(q) {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    // Client-side filter from full record — in production, add a search endpoint
    setResults([]);
  }

  async function loadFull(id) {
    const data = await api.getPatientFull(id);
    setRecord(data);
    setActiveTab('overview');
  }

  return (
    <section className="view">
      <h2 className="view-title">🔍 Patient Lookup</h2>
      <div className="card">
        <div className="search-bar">
          <input type="text" className="form-input" placeholder="Search by name or ID..." value={query} onChange={e => search(e.target.value)} />
        </div>
        <div className="patient-search-results mt-12">
          {results.map(p => (
            <div key={p.id} className="patient-item" onClick={() => loadFull(p.id)}>
              <div className="patient-avatar">{(p.display_name||'P')[0]}</div>
              <div className="patient-info"><div className="p-name">{p.display_name} <span style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>({p.id?.slice(0,8)})</span></div><div className="p-meta">{p.age} yrs • {p.prakriti}</div></div>
            </div>
          ))}
          {query.length >= 2 && results.length === 0 && <p className="muted">No patients found. Enter the patient's UUID directly to load their full record.</p>}
        </div>
      </div>
      {record && (
        <div className="mt-16">
          <div className="patient-record-card card">
            <h3>📋 Full Record: {record.display_name}</h3>
            <div className="record-tabs">
              {['overview','prescriptions','vega_bouts'].map(tab => <button key={tab} className={`record-tab${activeTab===tab?' active':''}`} onClick={() => setActiveTab(tab)}>{tab.replace('_',' ').replace(/^\w/,c=>c.toUpperCase())}</button>)}
            </div>
            {activeTab === 'overview' && (
              <div className="record-panel active">
                <p><strong>Age:</strong> {record.age} | <strong>Gender:</strong> {record.gender} | <strong>Blood Group:</strong> {record.blood_group}</p>
                <p><strong>Prakriti:</strong> {record.prakriti} | <strong>Phone:</strong> {record.phone}</p>
                <p><strong>Allergies:</strong> {record.allergies ? record.allergies.join(', ') : <em>Hidden</em>}</p>
                <p><strong>Mental Health:</strong> {record.mental_health ?? <em>Hidden</em>}</p>
              </div>
            )}
            {activeTab === 'prescriptions' && (
              <div className="record-panel active">
                {record.prescriptions?.length ? record.prescriptions.map((rx,i) => <div key={i} className="din-item"><span className="din-time">{new Date(rx.prescribed_at).toLocaleDateString()}</span><span className="din-task">{rx.medicine_name} — {rx.dosage}</span></div>) : <p className="muted">No prescriptions.</p>}
              </div>
            )}
            {activeTab === 'vega_bouts' && (
              <div className="record-panel active">
                {record.vega_bouts?.length ? record.vega_bouts.map((b,i) => <div key={i} className="din-item"><span className="din-time">{b.bout_time}</span><span className="din-task">Bout #{b.bout_number} — {b.therapy} — {b.volume} — {b.color}</span></div>) : <p className="muted">No vega bouts.</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
