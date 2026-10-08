// client/src/components/patient/AbhyangaGuide.jsx
import { useEffect, useRef, useState } from 'react';
import AbhyangaRenderer from '../../renderbit/AbhyangaRenderer';

const STEPS = [
  { title:'Crown (Murdha)',     desc:'Circular strokes from crown outward — 10 rotations each direction' },
  { title:'Face',               desc:'Upward strokes on cheeks, outward on forehead' },
  { title:'Neck & Shoulders',   desc:'Downward strokes on neck, circular on shoulders' },
  { title:'Arms',               desc:'Long strokes toward heart, circular on joints (elbows/wrists)' },
  { title:'Chest & Abdomen',    desc:'Circular clockwise strokes on abdomen, gentle on chest' },
  { title:'Back',               desc:'Upward long strokes from sacrum to neck' },
  { title:'Legs',               desc:'Long strokes toward heart, circular on knees and ankles' },
  { title:'Feet (Padabhyanga)', desc:'Circular on soles, between toes, Marma point stimulation' },
];

export default function AbhyangaGuide() {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const streamRef   = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [camMsg, setCamMsg] = useState('Press Start to activate camera guide');

  useEffect(() => {
    const t = setInterval(() => setActiveStep(s => (s + 1) % STEPS.length), 8000);
    return () => clearInterval(t);
  }, []);

  async function startCam() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setCamMsg('📷 Camera active — follow the stroke guide');
      rendererRef.current = new AbhyangaRenderer(canvasRef.current);
      rendererRef.current.start();
    } catch {
      setCamMsg('⚠️ Camera unavailable — use the guide manually');
    }
  }

  function stopCam() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    videoRef.current.srcObject = null;
    rendererRef.current?.stop();
    setCamMsg('Camera stopped');
  }

  return (
    <section className="view">
      <h2 className="view-title">💆 Home Massage Guide — Abhyanga</h2>
      <div className="grid-2">
        <div className="card">
          <h3>Camera Overlay Guide</h3>
          <div className="camera-container">
            <video ref={videoRef} autoPlay playsInline />
            <canvas ref={canvasRef} />
            <div className="cam-overlay-info">{camMsg}</div>
          </div>
          <div className="cam-controls">
            <button className="btn btn-primary" onClick={startCam}>📷 Start Camera</button>
            <button className="btn btn-danger"  onClick={stopCam}>⏹ Stop</button>
          </div>
        </div>
        <div className="card">
          <h3>Stroke Sequence Guide</h3>
          <div className="stroke-guide">
            {STEPS.map((s, i) => (
              <div key={i} className={`stroke-step${activeStep === i ? ' active' : ''}`}>
                <span className="stroke-num">{i + 1}</span>
                <div className="stroke-info"><div className="stroke-title">{s.title}</div><div className="stroke-desc">{s.desc}</div></div>
              </div>
            ))}
          </div>
          <div className="posture-checker mt-16">
            <h4>Posture Feedback</h4>
            <div className="posture-status good">✅ Posture looks aligned — continue</div>
          </div>
        </div>
      </div>
    </section>
  );
}
