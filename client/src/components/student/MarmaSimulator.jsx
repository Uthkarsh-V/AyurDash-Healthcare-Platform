import React, { useState, useEffect, useRef } from 'react';
import MarmaRenderer from '../../renderbit/MarmaRenderer';

export default function MarmaSimulator() {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  
  useEffect(() => {
    if (!rendererRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      rendererRef.current = new MarmaRenderer(canvas);
    }
    
    if (rendererRef.current) {
      rendererRef.current.update({ 
        onSelect: (p) => setSelectedPoint(p) 
      });
    }
  }, []);
  
  useEffect(() => {
    return () => {
      if (rendererRef.current) rendererRef.current.destroy();
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
            style={{ width: '100%', height: '600px', display: 'block' }}
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
