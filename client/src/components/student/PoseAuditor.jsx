// client/src/components/student/PoseAuditor.jsx
import { useEffect, useRef, useState } from 'react';
import PoseRenderer from '../../renderbit/PoseRenderer';

const FEEDBACKS = [
  { cls:'good', text:'✅ Excellent posture. Spine neutral, arms parallel. Stroke speed optimal.' },
  { cls:'good', text:'✅ Good bilateral synchronization. Coverage complete.' },
  { cls:'warn', text:'⚡ Right hand pressure slightly lower than left. Equalize for balance.' },
  { cls:'warn', text:'⚡ Stroke speed increased to 95/min. Slow down to 70–80 for therapeutic effect.' },
  { cls:'good', text:'✅ Back area covered correctly. Transition to lower limbs now.' },
];

export default function PoseAuditor() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const streamRef   = useRef(null);
  const [feedback, setFeedback] = useState(FEEDBACKS[0]);
  const [timer, setTimer]       = useState('0.0s');
  const [timerFb, setTimerFb]   = useState('');
  const timerState = useRef({ start: null, running: false, interval: null });

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => { i++; const f = FEEDBACKS[i % FEEDBACKS.length]; setFeedback(f); rendererRef.current?.setFeedback(f.cls); }, 4000);
    return () => clearInterval(t);
  }, []);

  async function startCam() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      rendererRef.current = new PoseRenderer(canvasRef.current);
      rendererRef.current.start();
    } catch { /* camera unavailable — simulation still runs */ }
  }

  function stopCam() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    videoRef.current.srcObject = null;
    rendererRef.current?.stop();
  }

  function startTimer() {
    if (timerState.current.running) return;
    timerState.current.running = true;
    timerState.current.start = Date.now();
    timerState.current.interval = setInterval(() => { setTimer(((Date.now() - timerState.current.start) / 1000).toFixed(1) + 's'); }, 100);
  }

  function stopTimer() {
    if (!timerState.current.running) return;
    clearInterval(timerState.current.interval);
    timerState.current.running = false;
    const elapsed = (Date.now() - timerState.current.start) / 1000;
    if (elapsed < 3) setTimerFb('⚡ Too fast! Ideal stroke is 3–6 seconds long.');
    else if (elapsed <= 6) setTimerFb('✅ Perfect stroke duration!');
    else setTimerFb('⚠️ Slightly slow. Ideal is 3–6 seconds.');
  }

  function resetTimer() {
    clearInterval(timerState.current.interval);
    timerState.current.running = false;
    setTimer('0.0s'); setTimerFb('');
  }

  const METRICS = [{ val:'72', label:'Strokes/min' },{ val:'✓', label:'Sync L/R' },{ val:'89%', label:'Coverage' },{ val:'4.2s', label:'Avg Stroke' }];

  return (
    <section className="view">
      <h2 className="view-title">🧪 Abhyanga Pose-Estimation Auditor</h2>
      <div className="grid-2">
        <div className="card">
          <h3>Live Therapist Feed</h3>
          <div className="camera-container"><video ref={videoRef} autoPlay playsInline /><canvas ref={canvasRef} /></div>
          <div className="cam-controls mt-8">
            <button className="btn btn-primary" onClick={startCam}>📷 Start Audit Feed</button>
            <button className="btn btn-danger"  onClick={stopCam}>⏹ Stop</button>
          </div>
        </div>
        <div className="card">
          <h3>Audit Metrics</h3>
          <div className="audit-metrics">{METRICS.map((m,i) => <div key={i} className="audit-metric"><div className="audit-metric-val">{m.val}</div><div className="audit-metric-label">{m.label}</div></div>)}</div>
          <div className={`audit-feedback ${feedback.cls} mt-12`}>{feedback.text}</div>
          <div className="mt-16">
            <h4>Stroke Speed Timer</h4>
            <div className="stroke-timer"><div className="timer-display">{timer}</div>
              <div className="timer-btns">
                <button className="btn btn-outline" onClick={startTimer}>Start</button>
                <button className="btn btn-outline" onClick={stopTimer}>Stop</button>
                <button className="btn btn-outline" onClick={resetTimer}>Reset</button>
              </div></div>
            {timerFb && <div className="mt-8">{timerFb}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
