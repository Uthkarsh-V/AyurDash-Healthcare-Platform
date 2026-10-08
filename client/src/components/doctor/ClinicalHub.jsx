// client/src/components/doctor/ClinicalHub.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api';

export default function ClinicalHub() {
  const { user } = useAuth();
  const [patients,  setPatients]  = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState({ patient_id:'', medicine_id:'', dosage:'', routine:'daily' });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) return;
    api.getDoctorPatients(user.id).then(setPatients).catch(() => {});
    api.getMedicines().then(setMedicines).catch(() => {});
  }, [user]);

  async function addPrescription() {
    if (!form.patient_id || !form.medicine_id || !form.dosage) return;
    const med = medicines.find(m => m.id === form.medicine_id);
    await api.addPrescription({ ...form, medicine_name: med?.name });
    setSuccess(`✅ ${med?.name} prescribed successfully!`);
    setTimeout(() => setSuccess(''), 4000);
    setForm({ patient_id:'', medicine_id:'', dosage:'', routine:'daily' });
  }

  return (
    <section className="view">
      <h2 className="view-title">🏥 Clinical Hub & Prescription Designer</h2>
      <div className="grid-2">
        <div className="card">
          <h3>My Patients</h3>
          <div className="patient-list">
            {patients.length === 0 && <p className="muted">No patients yet.</p>}
            {patients.map(p => (
              <div key={p.id} className="patient-item">
                <div className="patient-avatar">{(p.display_name || 'P')[0]}</div>
                <div className="patient-info">
                  <div className="p-name">{p.display_name}</div>
                  <div className="p-meta">{p.age} • {p.prakriti}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3>Design Prescription</h3>
          <div className="form-group"><label className="form-label">Select Patient</label>
            <select className="form-select" value={form.patient_id} onChange={e => setForm(f=>({...f,patient_id:e.target.value}))}>
              <option value="">-- Select --</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.display_name}</option>)}
            </select></div>
          <div className="form-group"><label className="form-label">Add Medicine</label>
            <select className="form-select" value={form.medicine_id} onChange={e => setForm(f=>({...f,medicine_id:e.target.value}))}>
              <option value="">-- Select Medicine --</option>
              {medicines.map(m => <option key={m.id} value={m.id}>{m.name} ({m.type})</option>)}
            </select></div>
          <div className="form-group"><label className="form-label">Dosage Instructions</label>
            <input type="text" className="form-input" placeholder="e.g. 5g with warm milk at bedtime" value={form.dosage} onChange={e => setForm(f=>({...f,dosage:e.target.value}))} /></div>
          <div className="form-group"><label className="form-label">Routine Type</label>
            <select className="form-select" value={form.routine} onChange={e => setForm(f=>({...f,routine:e.target.value}))}>
              <option value="daily">Daily Routine</option><option value="morning">Morning Only</option>
              <option value="evening">Evening Only</option><option value="asneeded">As Needed</option>
            </select></div>
          <button className="btn btn-primary" onClick={addPrescription}>📤 Send to Patient Dashboard</button>
          {success && <div className="alert-success mt-8">{success}</div>}
        </div>
      </div>
    </section>
  );
}
