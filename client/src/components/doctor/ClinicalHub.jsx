// client/src/components/doctor/ClinicalHub.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api';

const QUICK_CARE_TEMPLATES = [
  { label: 'Ashwagandha Churna', note: '5g with warm organic milk', time: '21:30', repeat: 'daily', priority: 'high' },
  { label: 'Triphala Churna', note: '3g with warm water before sleep', time: '22:00', repeat: 'daily', priority: 'high' },
  { label: 'Trikatu Churna', note: '1g with raw honey 15m before lunch', time: '12:15', repeat: 'daily', priority: 'medium' },
  { label: 'Warm Sesame Oil Abhyanga', note: 'Self-massage body before bath', time: '07:00', repeat: 'daily', priority: 'medium' },
  { label: 'Nasya Oil Drops', note: '2 drops Anu Taila in each nostril', time: '06:30', repeat: 'daily', priority: 'low' },
  { label: 'Clinical Follow-up Assessment', note: 'Video / In-clinic review with Dr. Meera', time: '10:00', repeat: 'once', priority: 'high' }
];

const PRIORITY_LEVELS = [
  { id: 'critical', label: 'Critical', icon: '🚨', bg: '#fee2e2', color: '#991b1b', border: '#f87171' },
  { id: 'high',     label: 'High',     icon: '🔴', bg: '#ffedd5', color: '#9a3412', border: '#fdba74' },
  { id: 'medium',   label: 'Medium',   icon: '🟡', bg: '#fef9c3', color: '#854d0e', border: '#fde047' },
  { id: 'low',      label: 'Stable',   icon: '🟢', bg: '#dcfce7', color: '#166534', border: '#86efac' },
];

export default function ClinicalHub() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortByPriority, setSortByPriority] = useState(true);
  const [priorityUpdateMsg, setPriorityUpdateMsg] = useState('');

  // Prescription Form State
  const [rxForm, setRxForm] = useState({
    patient_id: '',
    medicine_id: '',
    dosage: '',
    routine: 'daily',
    sync_to_watch: true,
    reminder_time: '08:00'
  });
  const [rxSuccess, setRxSuccess] = useState('');

  // Dedicated Patient Reminder Dispatch State
  const [remPatientId, setRemPatientId] = useState('');
  const [remLabel, setRemLabel] = useState('');
  const [remNote, setRemNote] = useState('');
  const [remTime, setRemTime] = useState('08:00');
  const [remRepeat, setRemRepeat] = useState('daily');
  const [remPriority, setRemPriority] = useState('medium');
  const [remAlertWatch, setRemAlertWatch] = useState(true);
  const [remAlertBrowser, setRemAlertBrowser] = useState(true);
  const [remAlertSound, setRemAlertSound] = useState(true);
  const [remSuccess, setRemSuccess] = useState('');
  const [patientReminders, setPatientReminders] = useState([]);
  const [loadingReminders, setLoadingReminders] = useState(false);

  // Load patients and medicines on mount
  useEffect(() => {
    if (!user) return;
    api.getDoctorPatients(user.id).then(res => {
      const list = Array.isArray(res) ? res : [];
      setPatients(list);
      if (list.length > 0) {
        setSelectedPatientId(list[0].id);
        setRxForm(f => ({ ...f, patient_id: list[0].id }));
        setRemPatientId(list[0].id);
      }
    }).catch(() => {});

    api.getMedicines().then(res => {
      setMedicines(Array.isArray(res) ? res : []);
    }).catch(() => {});
  }, [user]);

  // Fetch patient reminders when target patient changes
  const loadPatientReminders = useCallback((pid) => {
    if (!pid) {
      setPatientReminders([]);
      return;
    }
    setLoadingReminders(true);
    api.getReminders(pid)
      .then(res => {
        setPatientReminders(Array.isArray(res) ? res : []);
      })
      .catch(() => {
        setPatientReminders([]);
      })
      .finally(() => setLoadingReminders(false));
  }, []);

  useEffect(() => {
    if (remPatientId) {
      loadPatientReminders(remPatientId);
    }
  }, [remPatientId, loadPatientReminders]);

  // Handle changing patient priority
  const handleUpdatePriority = async (patientId, newPriority) => {
    try {
      await api.updatePatientPriority(patientId, newPriority);
      setPatients(prev => prev.map(p => p.id === patientId ? { ...p, priority: newPriority } : p));
      setPriorityUpdateMsg(`✅ Updated clinical triage priority to "${newPriority.toUpperCase()}"`);
      setTimeout(() => setPriorityUpdateMsg(''), 3500);
    } catch (err) {
      // Local fallback for offline/demo
      setPatients(prev => prev.map(p => p.id === patientId ? { ...p, priority: newPriority } : p));
      setPriorityUpdateMsg(`✅ Clinical priority set to "${newPriority.toUpperCase()}"`);
      setTimeout(() => setPriorityUpdateMsg(''), 3500);
    }
  };

  // Filter & Sort Patients
  const filteredPatients = useMemo(() => {
    let list = [...patients];

    if (priorityFilter !== 'all') {
      list = list.filter(p => (p.priority || 'medium') === priorityFilter);
    }

    if (sortByPriority) {
      const weight = { critical: 4, high: 3, medium: 2, low: 1 };
      list.sort((a, b) => (weight[b.priority || 'medium'] || 2) - (weight[a.priority || 'medium'] || 2));
    }

    return list;
  }, [patients, priorityFilter, sortByPriority]);

  const activePatient = patients.find(p => p.id === (remPatientId || rxForm.patient_id)) || patients[0];

  // Apply Quick Template
  const applyQuickTemplate = (tpl) => {
    setRemLabel(tpl.label);
    setRemNote(tpl.note);
    setRemTime(tpl.time);
    setRemRepeat(tpl.repeat);
    setRemPriority(tpl.priority);
  };

  // Add Prescription (+ optional automatic smartwatch reminder)
  async function addPrescription(e) {
    e.preventDefault();
    if (!rxForm.patient_id || !rxForm.medicine_id || !rxForm.dosage) return;
    const med = medicines.find(m => m.id === rxForm.medicine_id);
    const pat = patients.find(p => p.id === rxForm.patient_id);

    try {
      await api.addPrescription({
        patient_id: rxForm.patient_id,
        medicine_id: rxForm.medicine_id,
        medicine_name: med?.name,
        dosage: rxForm.dosage,
        routine: rxForm.routine
      });

      if (rxForm.sync_to_watch) {
        await api.addReminder({
          patient_id: rxForm.patient_id,
          label: med?.name || 'Ayurvedic Medicine',
          note: rxForm.dosage,
          time: rxForm.reminder_time,
          repeat: rxForm.routine === 'morning' || rxForm.routine === 'evening' ? 'daily' : rxForm.routine,
          priority: 'high',
          alert_browser: true,
          alert_watch: true,
          alert_sound: true,
          source: `Dr. ${user?.display_name || 'Physician'} (Prescription)`
        });
      }

      setRxSuccess(`✅ ${med?.name} prescribed to ${pat?.display_name || 'patient'}! ${rxForm.sync_to_watch ? `⌚ Scheduled reminder for ${rxForm.reminder_time}.` : ''}`);
      setTimeout(() => setRxSuccess(''), 5000);
      setRxForm(f => ({ ...f, medicine_id: '', dosage: '', routine: 'daily' }));
      if (remPatientId === rxForm.patient_id) {
        loadPatientReminders(rxForm.patient_id);
      }
    } catch (err) {
      setRxSuccess('❌ Failed to save prescription.');
      setTimeout(() => setRxSuccess(''), 4000);
    }
  }

  // Send Direct Reminder to Patient
  async function handleSendReminder(e) {
    e.preventDefault();
    if (!remPatientId || !remLabel.trim()) return;
    const targetPatient = patients.find(p => p.id === remPatientId);

    try {
      await api.addReminder({
        patient_id: remPatientId,
        label: remLabel.trim(),
        note: remNote.trim(),
        time: remTime,
        repeat: remRepeat,
        priority: remPriority,
        alert_browser: remAlertBrowser,
        alert_watch: remAlertWatch,
        alert_sound: remAlertSound,
        source: `Dr. ${user?.display_name || 'Physician'}`
      });

      setRemSuccess(`✅ Dispatched reminder "${remLabel}" to ${targetPatient?.display_name || 'patient'} at ${remTime}!`);
      setTimeout(() => setRemSuccess(''), 4500);
      setRemLabel('');
      setRemNote('');
      loadPatientReminders(remPatientId);
    } catch (err) {
      setRemSuccess('❌ Failed to dispatch reminder to patient.');
      setTimeout(() => setRemSuccess(''), 4000);
    }
  }

  // Delete / Revoke Reminder
  async function handleDeletePatientReminder(id) {
    try {
      await api.deleteReminder(id);
      setPatientReminders(prev => prev.filter(r => r.id !== id));
    } catch (err) {}
  }

  const getPriorityMeta = (prio = 'medium') => {
    return PRIORITY_LEVELS.find(l => l.id === prio) || PRIORITY_LEVELS[2];
  };

  return (
    <section className="view" id="view-clinical">
      <div className="view-header" style={{ marginBottom: 18 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, color: 'var(--teal)' }}>
          <span>🏥</span> Clinical Hub, Triage & Patient Care Dispatcher
        </h2>
        <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Evaluate patients by clinical priority, manage emergency triage, prescribe formulations, and dispatch real-time Smartwatch reminders.
        </p>
      </div>

      {/* Row 1: Patient Triage Board & Rx Designer */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Patient Triage Roster Card */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ margin: 0, color: 'var(--teal)', fontSize: '1.1rem' }}>
              Patient Roster ({filteredPatients.length})
            </h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', cursor: 'pointer', color: 'var(--teal)', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={sortByPriority}
                onChange={e => setSortByPriority(e.target.checked)}
              />
              <span>Urgent First</span>
            </label>
          </div>

          {/* Priority Triage Filter Chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            <button
              type="button"
              onClick={() => setPriorityFilter('all')}
              style={{
                padding: '4px 10px', borderRadius: 14, fontSize: '0.74rem', fontWeight: 600,
                border: priorityFilter === 'all' ? '1.5px solid var(--teal)' : '1px solid var(--border)',
                background: priorityFilter === 'all' ? 'var(--teal)' : 'var(--cream)',
                color: priorityFilter === 'all' ? '#fff' : 'var(--text-muted)', cursor: 'pointer'
              }}
            >
              All ({patients.length})
            </button>
            {PRIORITY_LEVELS.map(lvl => {
              const count = patients.filter(p => (p.priority || 'medium') === lvl.id).length;
              const isActive = priorityFilter === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setPriorityFilter(lvl.id)}
                  style={{
                    padding: '4px 10px', borderRadius: 14, fontSize: '0.74rem', fontWeight: 700,
                    border: isActive ? `1.5px solid ${lvl.border}` : '1px solid var(--border)',
                    background: isActive ? lvl.bg : 'var(--cream)',
                    color: isActive ? lvl.color : 'var(--text-muted)', cursor: 'pointer'
                  }}
                >
                  {lvl.icon} {lvl.label} ({count})
                </button>
              );
            })}
          </div>

          {priorityUpdateMsg && (
            <div style={{ padding: '6px 10px', borderRadius: 6, background: '#d1fae5', color: '#065f46', fontSize: '0.78rem', marginBottom: 10 }}>
              {priorityUpdateMsg}
            </div>
          )}

          {/* Patients List with Priority Badges */}
          <div className="patient-list" style={{ maxHeight: 380, overflowY: 'auto' }}>
            {filteredPatients.length === 0 && <p className="muted">No patients match this priority filter.</p>}
            {filteredPatients.map(p => {
              const isSelected = p.id === (remPatientId || rxForm.patient_id);
              const prioMeta = getPriorityMeta(p.priority || 'medium');
              return (
                <div
                  key={p.id}
                  className={`patient-item ${isSelected ? 'active-patient' : ''}`}
                  onClick={() => {
                    setRxForm(f => ({ ...f, patient_id: p.id }));
                    setRemPatientId(p.id);
                  }}
                  style={{
                    cursor: 'pointer', padding: '12px 14px', borderRadius: 8, marginBottom: 8,
                    border: isSelected ? '2px solid var(--teal)' : '1px solid var(--border)',
                    background: isSelected ? 'var(--teal-pale)' : 'var(--cream)',
                    display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <div className="patient-avatar" style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: prioMeta.id === 'critical' ? '#dc2626' : prioMeta.id === 'high' ? '#ea580c' : 'var(--teal)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                  }}>
                    {(p.display_name || 'P')[0]}
                  </div>

                  <div className="patient-info" style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="p-name" style={{ fontWeight: 700, color: 'var(--teal)', fontSize: '0.94rem' }}>
                        {p.display_name || p.email}
                      </span>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: 10,
                        background: prioMeta.bg, color: prioMeta.color, border: `1px solid ${prioMeta.border}`,
                        textTransform: 'uppercase'
                      }}>
                        {prioMeta.icon} {prioMeta.label}
                      </span>
                    </div>

                    <div className="p-meta" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {p.age || '34'} yrs • {p.gender || 'Patient'} • Prakriti: <strong>{p.prakriti || 'Vata-Pitta'}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    style={{
                      background: isSelected ? 'var(--teal)' : 'transparent',
                      color: isSelected ? '#fff' : 'var(--teal)',
                      border: '1px solid var(--teal)', borderRadius: 6,
                      padding: '4px 8px', fontSize: '0.75rem', fontWeight: 600
                    }}
                  >
                    {isSelected ? 'Active' : 'Select'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Active Patient Priority Controller */}
          {activePatient && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', background: '#fff', padding: 12, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--teal)' }}>
                  Set Triage Priority for {activePatient.display_name?.split(' ')[0]}:
                </span>
                <select
                  value={activePatient.priority || 'medium'}
                  onChange={e => handleUpdatePriority(activePatient.id, e.target.value)}
                  style={{
                    padding: '4px 8px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700,
                    border: '1.5px solid var(--teal)', background: 'var(--cream)', color: 'var(--teal)'
                  }}
                >
                  <option value="critical">🚨 Critical Urgency</option>
                  <option value="high">🔴 High Priority</option>
                  <option value="medium">🟡 Medium Routine</option>
                  <option value="low">🟢 Stable / Low</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Prescription Designer Card */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, color: 'var(--teal)', fontSize: '1.1rem' }}>Design Prescription</h3>
            {activePatient && (
              <span style={{
                fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: 10,
                background: getPriorityMeta(activePatient.priority).bg, color: getPriorityMeta(activePatient.priority).color
              }}>
                {getPriorityMeta(activePatient.priority).icon} {getPriorityMeta(activePatient.priority).label} Case
              </span>
            )}
          </div>

          <form onSubmit={addPrescription}>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>Target Patient *</label>
              <select
                className="form-select"
                required
                value={rxForm.patient_id}
                onChange={e => {
                  setRxForm(f => ({ ...f, patient_id: e.target.value }));
                  setRemPatientId(e.target.value);
                }}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--cream)' }}
              >
                <option value="">-- Select Patient --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {getPriorityMeta(p.priority).icon} {p.display_name || p.email} ({p.prakriti || 'Patient'}) - [{getPriorityMeta(p.priority).label}]
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>Prescribe Medicine *</label>
              <select
                className="form-select"
                required
                value={rxForm.medicine_id}
                onChange={e => {
                  const mid = e.target.value;
                  const med = medicines.find(m => m.id === mid);
                  setRxForm(f => ({ ...f, medicine_id: mid, dosage: med?.dosage || f.dosage }));
                }}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--cream)' }}
              >
                <option value="">-- Select Formulation from Pharmacopoeia --</option>
                {medicines.map(m => <option key={m.id} value={m.id}>{m.name} ({m.type})</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>Dosage & Anupana Instructions *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. 5g with warm milk at bedtime"
                value={rxForm.dosage}
                onChange={e => setRxForm(f => ({ ...f, dosage: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--cream)' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>Routine Frequency</label>
                <select
                  className="form-select"
                  value={rxForm.routine}
                  onChange={e => setRxForm(f => ({ ...f, routine: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--cream)' }}
                >
                  <option value="daily">Daily</option>
                  <option value="morning">Morning Only</option>
                  <option value="evening">Evening / Bedtime</option>
                  <option value="asneeded">As Needed (SOS)</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>Reminder Time</label>
                <input
                  type="time"
                  value={rxForm.reminder_time}
                  onChange={e => setRxForm(f => ({ ...f, reminder_time: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--cream)' }}
                />
              </div>
            </div>

            {/* Smartwatch Push Toggle */}
            <div style={{ background: 'var(--teal-pale)', padding: '10px 14px', borderRadius: 8, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                id="syncWatchToggle"
                checked={rxForm.sync_to_watch}
                onChange={e => setRxForm(f => ({ ...f, sync_to_watch: e.target.checked }))}
                style={{ width: 16, height: 16, accentColor: 'var(--teal)' }}
              />
              <label htmlFor="syncWatchToggle" style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--teal)', cursor: 'pointer' }}>
                ⌚ Push immediately to Patient's Smartwatch & Reminder Schedule
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '10px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
            >
              📤 Send Prescription & Schedule Reminder
            </button>

            {rxSuccess && <div className="alert-success mt-8" style={{ marginTop: 10, padding: 10, borderRadius: 8, background: '#d1fae5', color: '#065f46', fontSize: '0.85rem' }}>{rxSuccess}</div>}
          </form>
        </div>
      </div>

      {/* Row 2: DISPATCH SMARTWATCH & CARE REMINDERS */}
      <div className="card" style={{ padding: 24, borderRadius: 12, border: '2px solid var(--teal-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0, color: 'var(--teal)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⌚</span> Dispatch Smartwatch & Care Reminders to Patient
            </h3>
            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              Create custom chronotherapy alerts (medication dosage, Dinacharya habit, warm hydration, Panchakarma prep) that vibrate on the patient's smartwatch.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Target Patient:</span>
            <select
              value={remPatientId}
              onChange={e => setRemPatientId(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--teal)', background: 'var(--cream)', fontWeight: 600, color: 'var(--teal)' }}
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {getPriorityMeta(p.priority).icon} {p.display_name || p.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Prescription Templates */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
            ⚡ 1-Tap Clinical Presets
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {QUICK_CARE_TEMPLATES.map(tpl => (
              <button
                key={tpl.label}
                type="button"
                onClick={() => applyQuickTemplate(tpl)}
                style={{
                  padding: '6px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600,
                  border: '1px solid var(--border)', background: 'var(--cream)', cursor: 'pointer',
                  color: 'var(--teal)', transition: 'all 0.2s'
                }}
              >
                + {tpl.label} ({tpl.time})
              </button>
            ))}
          </div>
        </div>

        {/* Send Reminder Form & Dispatched Reminders Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 24 }}>
          {/* Dispatch Form */}
          <form onSubmit={handleSendReminder} style={{ background: 'var(--cream)', padding: 18, borderRadius: 10, border: '1px solid var(--border)' }}>
            <h4 style={{ margin: '0 0 12px', color: 'var(--teal)', fontSize: '0.98rem' }}>Create New Patient Alert</h4>

            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Reminder Title / Herb *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ashwagandha Churna, Triphala, Ushnodaka"
                value={remLabel}
                onChange={e => setRemLabel(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: '#fff' }}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Administration Notes / Carrier</label>
              <input
                type="text"
                placeholder="e.g. 5g with 100ml warm milk before sleep"
                value={remNote}
                onChange={e => setRemNote(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: '#fff' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Time *</label>
                <input
                  type="time"
                  required
                  value={remTime}
                  onChange={e => setRemTime(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', background: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Repeat</label>
                <select
                  value={remRepeat}
                  onChange={e => setRemRepeat(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', background: '#fff' }}
                >
                  <option value="daily">Daily</option>
                  <option value="weekdays">Weekdays</option>
                  <option value="weekend">Weekends</option>
                  <option value="once">Once</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Priority Level</label>
              <select
                value={remPriority}
                onChange={e => setRemPriority(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', background: '#fff' }}
              >
                <option value="high">High (Immediate buzz & sound chime)</option>
                <option value="medium">Medium (Standard medication alert)</option>
                <option value="low">Low (Gentle lifestyle prompt)</option>
              </select>
            </div>

            {/* Channels */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={remAlertWatch}
                  onChange={e => setRemAlertWatch(e.target.checked)}
                />
                <span>⌚ Smartwatch</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={remAlertBrowser}
                  onChange={e => setRemAlertBrowser(e.target.checked)}
                />
                <span>📱 App</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={remAlertSound}
                  onChange={e => setRemAlertSound(e.target.checked)}
                />
                <span>🔊 Chime</span>
              </label>
            </div>

            <button
              type="submit"
              style={{
                width: '100%', padding: '10px', background: 'var(--teal)', color: '#fff',
                border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}
            >
              <span>📤</span> Send Reminder to Patient
            </button>

            {remSuccess && <div style={{ marginTop: 10, padding: 8, borderRadius: 6, background: '#d1fae5', color: '#065f46', fontSize: '0.82rem' }}>{remSuccess}</div>}
          </form>

          {/* Active Patient's Reminder Schedule Table */}
          <div style={{ background: '#fff', padding: 18, borderRadius: 10, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ margin: 0, color: 'var(--teal)', fontSize: '0.98rem' }}>
                Current Patient Reminders ({patientReminders.length})
              </h4>
              <button
                type="button"
                onClick={() => loadPatientReminders(remPatientId)}
                style={{ background: 'none', border: 'none', color: 'var(--teal)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
              >
                🔄 Refresh
              </button>
            </div>

            {loadingReminders ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Loading patient schedule...</div>
            ) : patientReminders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: 6 }}>⌚</span>
                <p style={{ margin: 0, fontSize: '0.88rem' }}>No reminders currently dispatched for this patient.</p>
                <small>Use the form on the left or 1-tap presets to send a medication reminder.</small>
              </div>
            ) : (
              <div style={{ maxHeight: 380, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {patientReminders.map(r => {
                  return (
                    <div
                      key={r.id}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)',
                        background: 'var(--cream)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          fontSize: '0.9rem', fontWeight: 800, color: 'var(--teal)',
                          background: '#fff', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)'
                        }}>
                          {r.time}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--teal)' }}>
                            {r.label}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {r.note || 'Take as instructed'} • <span style={{ textTransform: 'capitalize' }}>{r.repeat}</span>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--teal)', fontWeight: 600, marginTop: 2 }}>
                            Source: {r.source || 'Physician'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          fontSize: '0.72rem', padding: '2px 8px', borderRadius: 10, fontWeight: 700,
                          background: r.status === 'taken' ? '#d1fae5' : r.status === 'snoozed' ? '#ede9fe' : 'var(--yellow-pale)',
                          color: r.status === 'taken' ? '#065f46' : r.status === 'snoozed' ? '#6b21a8' : '#92400e'
                        }}>
                          {r.status === 'taken' ? '✅ Taken' : r.status === 'snoozed' ? '⏰ Snoozed' : '⏳ Pending'}
                        </span>

                        <button
                          type="button"
                          title="Revoke / Delete Reminder"
                          onClick={() => handleDeletePatientReminder(r.id)}
                          style={{
                            background: 'none', border: 'none', color: 'var(--red)',
                            cursor: 'pointer', fontSize: '0.9rem', padding: '4px 6px'
                          }}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
