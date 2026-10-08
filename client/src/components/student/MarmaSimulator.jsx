import React, { useState, useEffect, useRef } from 'react';
import MarmaRenderer from '../../renderbit/MarmaRenderer';
import AiGuider from './AiGuider';

export default function MarmaSimulator() {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  
  useEffect(() => {
    if (canvasRef.current && !rendererRef.current) {
      const canvas = canvasRef.current;
      canvas.width = 800;
      canvas.height = 600;
      rendererRef.current = new MarmaRenderer(canvas);
      rendererRef.current.update({ 
        onSelect: (p) => setSelectedPoint(p) 
      });
    }
    
    return () => {
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
    };
  }, []);

  return (
    <div className="view" id="view-marmapoints">
      <div className="view-header">
        <h2>Marma Points Explorer</h2>
        <p>Interactive anatomy visualization of vital points (Marmas)</p>
      </div>
      <div className="view-body" style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: '2', background: '#111', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <canvas 
            ref={canvasRef} 
            style={{ width: '100%', height: '600px', display: 'block', touchAction: 'none' }}
          />
        </div>
        
        <div style={{ flex: '1' }}>
          <h3>Marma Details</h3>
          {selectedPoint ? (
            <div style={{ padding: '20px', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: 'var(--primary)' }}>{selectedPoint.name}</h4>
              <p><strong>Type:</strong> {selectedPoint.type}</p>
              <p><strong>Size (Pramana):</strong> {selectedPoint.size} Angula</p>
              <p style={{ marginTop: '15px', color: 'var(--text-muted)' }}>
                {selectedPoint.type === 'Sadhya Pranahara' && "Immediate fatal effect upon injury. Represents dominance of Agni Mahabhuta."}
                {selectedPoint.type === 'Kalantara Pranahara' && "Fatal effect after some time. Represents Agni & Soma."}
                {selectedPoint.type === 'Vishalyaghna' && "Fatal if foreign body is removed. Represents Vayu."}
                {selectedPoint.type === 'Rujakara' && "Causes severe pain. Represents Agni & Vayu."}
              </p>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Hover and click on a glowing point on the anatomical map to see detailed information.</p>
          )}
          
          <AiGuider 
            title="AI Anatomy Mentor" 
            guidelines={
              !selectedPoint ? "Welcome to the Marma Points Explorer. Hover or tap on any glowing anatomical node on the body to analyze its fatal characteristics and elemental dominance." :
              selectedPoint.type === 'Sadhya Pranahara' ? `Warning: ${selectedPoint.name} is a Sadhya Pranahara point. It contains high Agni (Fire) elements. Any surgical intervention near this area is highly contraindicated as injury causes immediate death.` :
              selectedPoint.type === 'Kalantara Pranahara' ? `The ${selectedPoint.name} point is Kalantara Pranahara (Delayed Fatal). It combines Agni (Fire) and Soma (Water). Injury here depletes the body's moisture, leading to gradual death.` :
              `The ${selectedPoint.name} point requires careful handling. It is classified as ${selectedPoint.type}. Note its exact dimension (${selectedPoint.size} Angula) when planning treatments.`
            } 
          />
          
          <div style={{ marginTop: '30px', padding: '15px', background: 'rgba(255, 77, 77, 0.1)', border: '1px solid #FF4D4D', borderRadius: '8px' }}>
            <h4>Legend</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '5px 0' }}>
              <span style={{ display:'block', width:12, height:12, borderRadius:'50%', background:'#FF4D4D' }}></span>
              Sadhya Pranahara (Immediate Fatal)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '5px 0' }}>
              <span style={{ display:'block', width:12, height:12, borderRadius:'50%', background:'#FFA500' }}></span>
              Kalantara Pranahara (Delayed Fatal)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '5px 0' }}>
              <span style={{ display:'block', width:12, height:12, borderRadius:'50%', background:'#4DB8FF' }}></span>
              Other Types
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
