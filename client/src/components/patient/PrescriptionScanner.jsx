// client/src/components/patient/PrescriptionScanner.jsx
import { useState } from 'react';

const PARSED_MEDS = [
  { name:'Ashwagandha Churna', dose:'5g with warm milk at bedtime', icon:'🌿' },
  { name:'Triphala Churna',    dose:'3g with warm water before sleep', icon:'🌿' },
  { name:'Brahmi Taila',       dose:'Apply 5ml warm oil to scalp nightly', icon:'💧' },
];
const SCHEDULE = [
  { time:'08:00', task:'Ashwagandha Churna 5g with warm milk' },
  { time:'21:00', task:'Triphala Churna 3g with warm water' },
  { time:'21:30', task:'Brahmi Taila scalp massage' },
];

export default function PrescriptionScanner() {
  const [preview, setPreview]   = useState(null);
  const [scanning, setScanning] = useState(false);
  const [meds, setMeds]         = useState(null);
  const [sched, setSched]       = useState(false);
  const [saved, setSaved]       = useState(false);

  function processFile(file) {
    const reader = new FileReader();
    reader.onload = e => {
      setPreview(e.target.result); setScanning(true); setMeds(null); setSched(false); setSaved(false);
      setTimeout(() => { setScanning(false); setMeds(PARSED_MEDS); setSched(true); }, 1800);
    };
    reader.readAsDataURL(file);
  }

  return (
    <section className="view">
      <h2 className="view-title">📋 AI Prescription Scanner</h2>
      <div className="grid-2">
        <div className="card">
          <h3>Upload Prescription</h3>
          <div className="upload-zone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) processFile(f); }}>
            <span className="upload-icon">📄</span>
            <p>Drag & drop prescription image here</p>
            <input type="file" id="prescriptionFile" accept="image/*" style={{ display:'none' }} onChange={e => { if (e.target.files[0]) processFile(e.target.files[0]); }} />
            <button className="btn btn-primary" onClick={() => document.getElementById('prescriptionFile').click()}>Choose File</button>
          </div>
          {preview && <div className="scan-preview"><img src={preview} alt="Prescription" />{scanning && <p className="muted mt-8">🔍 AI scanning your prescription...</p>}</div>}
        </div>
        <div className="card">
          <h3>Parsed Medications</h3>
          <div className="parsed-meds">
            {!meds ? <p className="muted">Upload a prescription to auto-parse medications.</p> : <>
              <p className="muted mb-12">✅ {meds.length} medications detected:</p>
              {meds.map((m, i) => <div key={i} className="parsed-med-item"><span className="parsed-med-icon">{m.icon}</span><div><div className="parsed-med-name">{m.name}</div><div className="parsed-med-dose">{m.dose}</div></div></div>)}
            </>}
          </div>
        </div>
      </div>
      {sched && !saved && (
        <div className="card mt-16">
          <h3>📅 Auto-Generated Schedule</h3>
          {SCHEDULE.map((s, i) => <div key={i} className="din-item"><span className="din-time">{s.time}</span><span className="din-task">{s.task}</span></div>)}
          <button className="btn btn-success mt-8" onClick={() => setSaved(true)}>✔ Add to My Dinacharya</button>
        </div>
      )}
      {saved && <div className="card mt-16 alert-success">📅 Schedule added to your Dinacharya!</div>}
    </section>
  );
}
