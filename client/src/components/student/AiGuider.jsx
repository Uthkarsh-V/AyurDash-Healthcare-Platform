import React, { useState, useEffect } from 'react';

export default function AiGuider({ title, guidelines }) {
  const [currentText, setCurrentText] = useState('');

  // Typewriter effect
  useEffect(() => {
    setCurrentText('');
    
    if (!guidelines) return;
    
    let i = 0;
    const interval = setInterval(() => {
      setCurrentText(guidelines.substring(0, i));
      i++;
      if (i > guidelines.length) clearInterval(interval);
    }, 25); // typing speed
    
    return () => clearInterval(interval);
  }, [guidelines]);

  return (
    <div style={{
      marginTop: '20px',
      padding: '20px',
      background: 'linear-gradient(135deg, rgba(46, 204, 113, 0.1), rgba(39, 174, 96, 0.2))',
      border: '1px solid #2ecc71',
      borderRadius: '12px',
      display: 'flex',
      gap: '20px',
      alignItems: 'flex-start',
      boxShadow: '0 4px 15px rgba(46, 204, 113, 0.05)'
    }}>
      <div style={{
        fontSize: '1.8rem',
        background: '#fff',
        borderRadius: '50%',
        width: '55px',
        height: '55px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        flexShrink: 0
      }}>
        🤖
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0', color: '#27ae60', fontSize: '1.1rem' }}>{title || 'AI Mentor Guidelines'}</h4>
        <p style={{ margin: 0, lineHeight: '1.6', color: 'var(--text-color)', fontSize: '1.05rem' }}>
          {currentText}
          <span className="ai-cursor" style={{ opacity: currentText.length < guidelines?.length ? 1 : 0 }}>|</span>
        </p>
      </div>
    </div>
  );
}
