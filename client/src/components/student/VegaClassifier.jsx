import React, { useState } from 'react';

const CASES = [
  { id: 1, symptoms: "Patient presents with severe headache, facial paralysis (Ardita), and stiffness in the neck. They mention suppressing a natural urge during a meeting.", correct: 'kshavathu', urge: 'Sneezing (Kshavathu)' },
  { id: 2, symptoms: "Patient complains of skin diseases (Visarpa), itching, and fever. They have a habit of suppressing this urge after meals.", correct: 'chhardi', urge: 'Vomiting (Chhardi)' },
  { id: 3, symptoms: "Patient reports pain in the abdomen, upward movement of Vata, and extreme fatigue.", correct: 'vata', urge: 'Flatus (Apana Vata)' },
  { id: 4, symptoms: "Patient experiences stones in the urinary tract, pain in the groin, and dysuria.", correct: 'mutra', urge: 'Urine (Mutra)' },
  { id: 5, symptoms: "Patient shows emaciation, deafness, and delusion. They often ignore this urge while working outdoors.", correct: 'trishna', urge: 'Thirst (Trishna)' },
  { id: 6, symptoms: "Patient reports yawning, body ache, heavy head, and diseases of the eyes.", correct: 'nidra', urge: 'Sleep (Nidra)' }
];

const URGES = [
  { id: 'kshavathu', name: 'Sneezing (Kshavathu)' },
  { id: 'chhardi', name: 'Vomiting (Chhardi)' },
  { id: 'vata', name: 'Flatus (Apana Vata)' },
  { id: 'mutra', name: 'Urine (Mutra)' },
  { id: 'trishna', name: 'Thirst (Trishna)' },
  { id: 'purisha', name: 'Feces (Purisha)' },
  { id: 'nidra', name: 'Sleep (Nidra)' },
  { id: 'ashru', name: 'Tears (Ashru)' },
];

export default function VegaClassifier() {
  const [currentCase, setCurrentCase] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);

  const handleGuess = (urgeId) => {
    const c = CASES[currentCase];
    if (urgeId === c.correct) {
      setFeedback({ type: 'success', text: `Correct! Suppressing ${c.urge} causes these exact symptoms according to Charaka Samhita.` });
      setScore(s => s + 1);
      setTimeout(() => {
        setFeedback(null);
        setCurrentCase((prev) => (prev + 1) % CASES.length);
      }, 2500);
    } else {
      setFeedback({ type: 'error', text: `Incorrect. Try again.` });
    }
  };

  return (
    <div className="view" id="view-vegaclass">
      <div className="view-header">
        <h2>Vega Bout Classifier (Adharaniya Vegas)</h2>
        <p>Analyze clinical presentations to identify the suppressed natural urge.</p>
      </div>
      
      <div className="view-body" style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ padding: '20px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <h3 style={{ marginTop: 0, color: 'var(--primary)' }}>Clinical Case #{currentCase + 1}</h3>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.6', margin: '20px 0' }}>
              "{CASES[currentCase].symptoms}"
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--border)' }}>
              <strong>Score: {score}</strong>
              <span style={{ color: 'var(--text-muted)' }}>Case {currentCase + 1} of {CASES.length}</span>
            </div>
          </div>
          
          {feedback && (
            <div style={{ 
              padding: '15px', borderRadius: '8px', 
              background: feedback.type === 'success' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)',
              border: `1px solid ${feedback.type === 'success' ? '#2ecc71' : '#e74c3c'}`,
              color: feedback.type === 'success' ? '#2ecc71' : '#e74c3c'
            }}>
              {feedback.text}
            </div>
          )}
        </div>
        
        <div style={{ flex: '1' }}>
          <h3>Which Vega was suppressed?</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
            {URGES.map(u => (
              <button 
                key={u.id}
                onClick={() => handleGuess(u.id)}
                disabled={feedback?.type === 'success'}
                style={{
                  padding: '15px', background: 'var(--card-bg)', border: '1px solid var(--border)', 
                  borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
                  color: 'var(--text-color)', fontSize: '1rem'
                }}
                onMouseOver={(e) => e.target.style.background = 'var(--primary)'}
                onMouseOut={(e) => e.target.style.background = 'var(--card-bg)'}
              >
                {u.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
