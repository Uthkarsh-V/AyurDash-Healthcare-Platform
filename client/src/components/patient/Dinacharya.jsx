// client/src/components/patient/Dinacharya.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api';
import { defaultDinacharya } from '../../data/ayurdb';

export default function Dinacharya() {
  const { user } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const [tasks, setTasks] = useState(defaultDinacharya.map((t, i) => ({ ...t, done: false, task_index: i })));
  const [dosha, setDosha] = useState({ vata: 42, pitta: 35, kapha: 23 });
  const [breathActive, setBreathActive] = useState(false);
  const [breathLabel, setBreathLabel] = useState('Tap to start guided breathing');
  const [breathCls, setBreathCls] = useState('breath-circle');

  useEffect(() => {
    if (!user) return;
    api.getPatient(user.id).then(p => { if (p) setDosha({ vata: p.dosha_vata, pitta: p.dosha_pitta, kapha: p.dosha_kapha }); }).catch(() => {});
    api.getDinacharyaTasks(user.id, today).then(rows => {
      if (rows?.length) setTasks(defaultDinacharya.map((t, i) => ({ ...t, task_index: i, done: rows.find(r => r.task_index === i)?.done || false })));
    }).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!breathActive) return;
    const phases = [
      { label: '🌬 Inhale... (4 sec)', cls: 'breath-circle inhale', dur: 4000 },
      { label: '🤲 Hold... (4 sec)',   cls: 'breath-circle',        dur: 4000 },
      { label: '💨 Exhale... (6 sec)', cls: 'breath-circle exhale', dur: 6000 },
    ];
    let idx = 0, timer;
    const next = () => { const p = phases[idx % 3]; setBreathLabel(p.label); setBreathCls(p.cls); idx++; timer = setTimeout(next, p.dur); };
    next();
    return () => clearTimeout(timer);
  }, [breathActive]);

  function toggleTask(i) {
    setTasks(prev => {
      const updated = prev.map((t, idx) => idx === i ? { ...t, done: !t.done } : t);
      if (user) api.toggleDinacharyaTask(user.id, today, i, { done: updated[i].done, task_text: updated[i].task, task_time: updated[i].time }).catch(() => {});
      return updated;
    });
  }

  const done = tasks.filter(t => t.done).length;

  return (
    <section className="view">
      <h2 className="view-title">🌅 Daily Dashboard — Dinacharya</h2>
      <div className="grid-3">
        <div className="card dosha-card">
          <h3>Dosha Balance</h3>
          {[['Vata', dosha.vata, 'vata-fill', 'var(--teal)'], ['Pitta', dosha.pitta, 'pitta-fill', 'var(--saffron)'], ['Kapha', dosha.kapha, 'kapha-fill', 'var(--green)']].map(([name, val, cls, color]) => (
            <div key={name} className="dosha-bar-row">
              <span className="dosha-label">{name}</span>
              <div className="dosha-track"><div className={`dosha-fill ${cls}`} style={{ width: `${val}%` }} /></div>
              <span className="dosha-val" style={{ color }}>{val}%</span>
            </div>
          ))}
        </div>
        <div className="card wellness-card">
          <h3>Mental Wellness</h3>
          <div className="breathing-guide">
            <div className={breathCls} />
            <p>{breathLabel}</p>
            <button className="btn btn-primary" onClick={() => setBreathActive(a => !a)}>{breathActive ? '⏹ Stop' : '▶ Start Pranayama'}</button>
          </div>
        </div>
        <div className="card">
          <h3>Today's Summary</h3>
          <div className="summary-stats">
            <div className="stat-row"><span className="stat-label">Routine Progress</span><span className="stat-val">{done}/{tasks.length} tasks</span></div>
            <div className="stat-row"><span className="stat-label">Dosha</span><span className="stat-val text-teal">Vata-Pitta</span></div>
          </div>
        </div>
      </div>
      <div className="card mt-16">
        <h3>Daily Routine Tasks</h3>
        <div className="dinacharya-list">
          {tasks.map((t, i) => (
            <div key={i} className={`din-item${t.done ? ' done' : ''}`}>
              <span className="din-time">{t.time}</span>
              <span className="din-task" style={{ textDecoration: t.done ? 'line-through' : '' }}>{t.task}</span>
              <div className={`din-check${t.done ? ' checked' : ''}`} onClick={() => toggleTask(i)}>{t.done ? '✓' : ''}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
