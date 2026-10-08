import React, { useState, useEffect, useRef } from 'react';
import ShastraKarmaRenderer from '../../renderbit/ShastraKarmaRenderer';
import AiGuider from './AiGuider';

const KARMAS = [
  { id: 'chedana', name: 'Chedana (Excision)', target: 'Pumpkin / Ash Gourd (Pushpaphala)' },
  { id: 'bhedana', name: 'Bhedana (Incision/Drainage)', target: 'Water bladder (Basti/Druti)' },
  { id: 'lekhana', name: 'Lekhana (Scraping)', target: 'Hairy skin (Savyoma charma)' },
  { id: 'vyadhana', name: 'Vyadhana (Puncturing)', target: 'Vein (Sira) / Lotus stalk' },
];

export default function ShastraKarmaSimulator() {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const [activeKarma, setActiveKarma] = useState('chedana');
  
  useEffect(() => {
    if (canvasRef.current && !rendererRef.current) {
      const canvas = canvasRef.current;
      canvas.width = 800;
      canvas.height = 600;
      rendererRef.current = new ShastraKarmaRenderer(canvas);
      rendererRef.current.update({ karma: activeKarma });
    }
    
    return () => {
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.update({ karma: activeKarma });
    }
  }, [activeKarma]);

  return (
    <div className="view" id="view-shastrakarma">
      <div className="view-header">
        <h2>Ashta Vidha Shastra Karma Simulator</h2>
        <p>Practice Sushruta's 8 surgical techniques using authentic proxy objects</p>
      </div>
      <div className="view-body" style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: '1' }}>
          <h3>Select Karma</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {KARMAS.map(k => (
              <button 
                key={k.id}
                onClick={() => setActiveKarma(k.id)}
                style={{
                  padding: '12px', textAlign: 'left',
                  background: activeKarma === k.id ? 'var(--primary)' : 'var(--card-bg)',
                  color: activeKarma === k.id ? 'white' : 'inherit',
                  border: '1px solid var(--border)', borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <strong>{k.name}</strong><br/>
                <small style={{ color: activeKarma === k.id ? '#ddd' : 'var(--text-muted)' }}>Object: {k.target}</small>
              </button>
            ))}
          </div>
          <div style={{ marginTop: '20px', padding: '15px', background: 'var(--card-bg)', borderRadius: '8px' }}>
            <h4>Instructions</h4>
            <p>
              {activeKarma === 'chedana' && "Click and drag across the pumpkin to practice clean excisions."}
              {activeKarma === 'bhedana' && "Click on the bladder to practice puncturing and releasing fluid (drainage)."}
              {activeKarma === 'lekhana' && "Click and drag to scrape hair/impurities off the skin surface."}
              {activeKarma === 'vyadhana' && "Click on the red vein target to practice precise puncturing."}
            </p>
          </div>
          
          <AiGuider 
            title="AI Surgical Mentor" 
            guidelines={
              activeKarma === 'chedana' ? "Chedana involves excision. Use your pointer to draw a clean, continuous line across the Pushpaphala (Ash Gourd). Focus on maintaining a steady hand and uniform pressure." :
              activeKarma === 'bhedana' ? "Bhedana is incision and drainage. Tap precisely on the Basti (water bladder) to puncture it. Notice how the internal pressure forces the fluid out. You must be quick and precise." :
              activeKarma === 'lekhana' ? "Lekhana is scraping. Gently drag your tool repeatedly over the Savyoma Charma (hairy skin) to remove the superficial layers. Do not press too deeply." :
              "Vyadhana is puncturing. Carefully tap the red Sira (vein). In ancient times, a lotus stalk was used to train this delicate technique. Avoid piercing entirely through the object."
            } 
          />
        </div>
        
        <div style={{ flex: '2', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <canvas 
            ref={canvasRef} 
            style={{ width: '100%', height: '500px', display: 'block', cursor: 'crosshair', touchAction: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}
