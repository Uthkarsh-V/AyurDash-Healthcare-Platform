// client/src/components/student/NetraSimulator.jsx
import { useEffect, useRef, useState } from 'react';
import NetraRenderer from '../../renderbit/NetraRenderer';
import { netraTarpana } from '../../data/ayurdb';

export default function NetraSimulator() {
  const canvasRef  = useRef(null);
  const rendererRef = useRef(null);
  const [thickness, setThickness] = useState(2.5);
  const [temp, setTemp]           = useState(37);
  const [feedback, setFeedback]   = useState({ cls:'safe', text:'✅ Adjust sliders to begin assessment.' });

  useEffect(() => {
    if (canvasRef.current) {
      rendererRef.current = new NetraRenderer(canvasRef.current);
      rendererRef.current.update({ thickness, temp, nodes: netraTarpana.orbitalNodes });
    }
    return () => rendererRef.current?.destroy?.();
  }, []);

  function handleUpdate(t, tp) {
    rendererRef.current?.update({ thickness: t, temp: tp, nodes: netraTarpana.orbitalNodes });
    const { min, max, ideal } = netraTarpana.doughThickness;
    const { min: tMin, max: tMax } = netraTarpana.oilTemp;
    if (t < min)       setFeedback({ cls:'danger',  text:`⚠️ Dough wall too thin (${t}cm)! Minimum is ${min}cm. High leakage risk.` });
    else if (t > max)  setFeedback({ cls:'caution', text:`⚡ Dough wall too thick (${t}cm). May restrict vision. Ideal: ${ideal}cm.` });
    else if (tp < tMin || tp > tMax) setFeedback({ cls:'danger', text:`🌡 Oil temperature ${tp}°C is outside safe range (${tMin}–${tMax}°C). Risk of burning!` });
    else               setFeedback({ cls:'safe',    text:`✅ Excellent! Dough wall ${t}cm at ${tp}°C — within safe parameters. Proceed with therapy.` });
  }

  const CHECKLIST = ['Prepare Ksheera (medicated milk) at 37°C','Mix flour dough to correct consistency','Position patient supine, eyes closed','Build dough ring — min 2cm thickness','Check for gaps at medial & lateral canthi','Slowly pour warm ghee/oil into ring','Maintain oil level for prescribed duration','Ask patient to blink gently every 30 sec','Remove dough carefully after therapy','Apply Triphala eye wash post-procedure'];

  return (
    <section className="view">
      <h2 className="view-title">👁 Netra Tarpana Leakage Simulator</h2>
      <div className="grid-2">
        <div className="card">
          <h3>Eye Diagram — Place Dough Walls</h3>
          <div className="netra-diagram-wrap"><canvas ref={canvasRef} width="400" height="300" /></div>
          <div className="netra-controls">
            <label className="form-label">Dough Thickness: <strong>{thickness}</strong> cm</label>
            <input type="range" min="1" max="5" step="0.1" value={thickness} onChange={e => { const v = parseFloat(e.target.value); setThickness(v); handleUpdate(v, temp); }} />
            <label className="form-label">Oil Temperature: <strong>{temp}</strong> °C</label>
            <input type="range" min="30" max="45" step="1" value={temp} onChange={e => { const v = parseInt(e.target.value); setTemp(v); handleUpdate(thickness, v); }} />
          </div>
          <div className={`netra-feedback ${feedback.cls} mt-12`}>{feedback.text}</div>
        </div>
        <div className="card">
          <h3>Node Risk Assessment</h3>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.85rem' }}>
            <thead><tr><th style={{padding:'6px',textAlign:'left'}}>Node</th><th>Location</th><th>Leakage Risk</th></tr></thead>
            <tbody>{netraTarpana.orbitalNodes.map(n => {
              const cls = { High:'risk-high', Medium:'risk-medium', Low:'risk-low' }[n.leakRisk];
              return <tr key={n.id}><td><strong>{n.id}</strong></td><td>{n.label}</td><td><span className={`risk-badge ${cls}`}>{n.leakRisk}</span></td></tr>;
            })}</tbody>
          </table>
          <h4 className="mt-16">Procedure Checklist</h4>
          <div className="checklist">{CHECKLIST.map((item, i) => (
            <div key={i} className="check-item"><input type="checkbox" />{item}</div>
          ))}</div>
        </div>
      </div>
    </section>
  );
}
