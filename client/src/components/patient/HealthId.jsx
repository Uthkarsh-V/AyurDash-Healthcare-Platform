// client/src/components/patient/HealthId.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api';

export default function HealthId() {
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [privacy, setPrivacy] = useState({ privacy_allergies:true, privacy_treatments:true, privacy_mental_health:false, privacy_lab_reports:true });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.getPatient(user.id).then(p => { if (p) { setPatient(p); setPrivacy({ privacy_allergies:p.privacy_allergies, privacy_treatments:p.privacy_treatments, privacy_mental_health:p.privacy_mental_health, privacy_lab_reports:p.privacy_lab_reports }); } }).catch(() => {});
  }, [user]);

  function savePrivacy() {
    api.updatePrivacy(user.id, privacy).then(() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }).catch(() => {});
  }

  return (
    <section className="view">
      <h2 className="view-title">🪪 Digital Health ID & Privacy</h2>
      <div className="grid-2">
        <div className="card health-id-card">
          <h3 style={{ color:'rgba(255,255,255,0.8)' }}>🌿 Digital Health ID</h3>
          <div className="hid-name">{user?.display_name || user?.email}</div>
          <div className="hid-id">ID: {user?.id?.slice(0,8)}… &nbsp;•&nbsp; {patient?.blood_group || 'B+'}</div>
          <div className="hid-row">
            <div className="hid-field"><span className="hid-field-label">Age</span><span className="hid-field-val">{patient?.age || '—'}</span></div>
            <div className="hid-field"><span className="hid-field-label">Gender</span><span className="hid-field-val">{patient?.gender || '—'}</span></div>
          </div>
          <span className="hid-prakriti-badge">🌿 Prakriti: {patient?.prakriti || 'Vata-Pitta'}</span>
          <div className="hid-qr">
            <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
              {[1,0,1,1,0,0,1,0,1,0,1,1,0,0,1,1,0,1,0,0,1,0,1,1,0,0,1,0,1,0,1,1,0,0,1,1].map((v,i) => v ? <rect key={i} x={(i%6)*9+3} y={Math.floor(i/6)*9+3} width="7" height="7" fill="#1e1e1e" /> : null)}
            </svg>
          </div>
        </div>
        <div className="card">
          <h3>🛡 Privacy Controls</h3>
          <p className="muted mb-12">Managed by AI Clinical Guardian — control what your doctor sees</p>
          <div className="privacy-controls">
            {[['privacy_allergies','Share Allergies','Doctor can see allergy list'],['privacy_treatments','Share Treatment History','Doctor can view past treatments'],['privacy_mental_health','Share Mental Health Notes','Sensitive — off by default'],['privacy_lab_reports','Share Lab Reports','Doctor can access lab results']].map(([key,label,desc]) => (
              <div key={key} className="privacy-item">
                <div className="privacy-item-info"><span className="privacy-item-label">{label}</span><span className="privacy-item-desc">{desc}</span></div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={privacy[key] || false} onChange={e => setPrivacy(p => ({ ...p, [key]: e.target.checked }))} />
                  <span className="toggle-slider" />
                </label>
              </div>
            ))}
          </div>
          <button className="btn btn-success mt-16" onClick={savePrivacy}>💾 Save Privacy Settings</button>
          {saved && <div className="alert-success mt-8">🛡 Privacy settings saved by AI Clinical Guardian</div>}
        </div>
      </div>
    </section>
  );
}
