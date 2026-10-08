// client/src/components/doctor/VegaMonitor.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api';

export default function VegaMonitor() {
  const { user } = useAuth();
  const [patients, setPatients]   = useState([]);
  const [pid, setPid]             = useState('');
  const [bouts, setBouts]         = useState([]);
  const [form, setForm]           = useState({ therapy:'Virechana', volume:'moderate', color:'yellow-green', consistency:'semi-formed', notes:'' });
  const [outcome, setOutcome]     = useState('');

  useEffect(() => { if (user) api.getDoctorPatients(user.id).then(setPatients).catch(() => {}); }, [user]);

  useEffect(() => {
    if (!pid) return;
    api.getVegaBouts(pid).then(setBouts).catch(() => {});
  }, [pid]);

  async function logBout() {
    if (!pid) return;
    const bout = { patient_id: pid, ...form, bout_time: new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}), bout_number: bouts.length + 1 };
    const saved = await api.logVegaBout(bout);
    setBouts(prev => [...prev, saved]);
    const total = bouts.length + 1;
    if (total >= 5 && total <= 10) setOutcome(`<div class="alert-success">✅ Samyak Virechana — ${total} bouts — Proper elimination achieved!</div>`);
    else if (total < 5) setOutcome(`<div class="alert-warning">⚠️ Heena Virechana — Only ${total} bouts — Incomplete. Monitor closely.</div>`);
    else setOutcome(`<div class="alert-danger">🚨 Ati Virechana — ${total} bouts — Excessive! Stop therapy immediately.</div>`);
  }

  const COLOR_MAP = {'yellow-green':'#a3b18a','dark-green':'#2d6a4f','yellow':'#f4d03f','clear':'#cde','watery':'#cde','brown':'#8b5e3c'};

  return (
    <section className="view">
      <h2 className="view-title">📊 Vega Bout Elimination Monitor</h2>
      <div className="grid-2">
        <div className="card">
          <h3>Live Ledger</h3>
          <div className="form-group"><label className="form-label">Select Patient</label>
            <select className="form-select" value={pid} onChange={e => setPid(e.target.value)}>
              <option value="">-- Select Patient --</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.display_name}</option>)}
            </select></div>
          <div className="vega-ledger">
            {bouts.map((b, i) => <div key={i} className="bout-row"><span>{b.bout_time}</span><div className="bout-num">{b.bout_number}</div><span>{b.volume}</span><span style={{display:'flex',alignItems:'center',gap:4}}><span style={{width:10,height:10,borderRadius:'50%',background:COLOR_MAP[b.color]||'#aaa',display:'inline-block'}} />{b.color}</span><span>{b.notes}</span></div>)}
            {!bouts.length && <p className="muted">No bouts logged yet.</p>}
          </div>
        </div>
        <div className="card">
          <h3>Log New Bout</h3>
          {[['therapy','Therapy',<select className="form-select" value={form.therapy} onChange={e=>setForm(f=>({...f,therapy:e.target.value}))}><option>Virechana</option><option>Vamana</option></select>],
            ['volume','Volume',<select className="form-select" value={form.volume} onChange={e=>setForm(f=>({...f,volume:e.target.value}))}><option value="trace">Trace</option><option value="small">Small</option><option value="moderate">Moderate</option><option value="large">Large</option></select>],
            ['color','Color',<select className="form-select" value={form.color} onChange={e=>setForm(f=>({...f,color:e.target.value}))}><option value="yellow">Yellow</option><option value="yellow-green">Yellow-Green</option><option value="dark-green">Dark Green</option><option value="brown">Brown</option><option value="clear">Clear/Watery</option></select>],
            ['consistency','Consistency',<select className="form-select" value={form.consistency} onChange={e=>setForm(f=>({...f,consistency:e.target.value}))}><option value="formed">Formed</option><option value="semi-formed">Semi-Formed</option><option value="semi-liquid">Semi-Liquid</option><option value="liquid">Liquid</option></select>],
          ].map(([key,lbl,el]) => <div key={key} className="form-group"><label className="form-label">{lbl}</label>{el}</div>)}
          <div className="form-group"><label className="form-label">Notes</label><input type="text" className="form-input" placeholder="Observation notes..." value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} /></div>
          <button className="btn btn-primary" onClick={logBout}>➕ Log Bout</button>
          {outcome && <div className="mt-12" dangerouslySetInnerHTML={{ __html: outcome }} />}
        </div>
      </div>
    </section>
  );
}
