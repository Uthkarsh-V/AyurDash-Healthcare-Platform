import React, { useState } from 'react';

const FOODS = [
  { id: 'milk', name: 'Milk (Kshira)', icon: '🥛' },
  { id: 'fish', name: 'Fish (Matsya)', icon: '🐟' },
  { id: 'honey', name: 'Honey (Madhu)', icon: '🍯' },
  { id: 'ghee', name: 'Ghee (Ghrita)', icon: '🧈' },
  { id: 'sour_fruit', name: 'Sour Fruits', icon: '🍋' },
  { id: 'radish', name: 'Radish (Mulaka)', icon: '🥕' },
  { id: 'jaggery', name: 'Jaggery (Guda)', icon: '🥮' },
  { id: 'curd', name: 'Curd (Dadhi)', icon: '🥣' }
];

const VIRUDDHA_RULES = [
  { pair: ['milk', 'fish'], type: 'Samyoga Viruddha (Combination)', effect: 'Produces toxins (Ama), causes skin diseases (Kustha) and blocks channels (Srotorodha).' },
  { pair: ['milk', 'sour_fruit'], type: 'Samyoga Viruddha (Combination)', effect: 'Causes indigestion, acidity, and skin disorders due to opposing Veerya.' },
  { pair: ['honey', 'ghee'], type: 'Matra Viruddha (Quantity)', effect: 'When mixed in exactly equal quantities by weight, they become toxic (Visha).' },
  { pair: ['milk', 'radish'], type: 'Samyoga Viruddha (Combination)', effect: 'Causes skin diseases and digestive issues.' },
  { pair: ['honey', 'radish'], type: 'Samyoga Viruddha (Combination)', effect: 'Produces toxic effects in the body.' },
  { pair: ['fish', 'jaggery'], type: 'Samyoga Viruddha (Combination)', effect: 'Incompatible due to opposing potencies.' }
];

export default function ViruddhaChecker() {
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [result, setResult] = useState(null);

  const toggleFood = (id) => {
    setResult(null);
    if (selectedFoods.includes(id)) {
      setSelectedFoods(selectedFoods.filter(f => f !== id));
    } else {
      if (selectedFoods.length >= 2) {
        setSelectedFoods([selectedFoods[1], id]); // Keep last one, add new one
      } else {
        setSelectedFoods([...selectedFoods, id]);
      }
    }
  };

  const checkCombination = () => {
    if (selectedFoods.length !== 2) return;
    const rule = VIRUDDHA_RULES.find(r => 
      r.pair.includes(selectedFoods[0]) && r.pair.includes(selectedFoods[1])
    );
    
    if (rule) {
      setResult({ incompatible: true, ...rule });
    } else {
      setResult({ incompatible: false, effect: 'This combination is generally considered safe (Pathya) according to Ayurveda.' });
    }
  };

  return (
    <div className="view" id="view-viruddha">
      <div className="view-header">
        <h2>Viruddha Ahara (Incompatible Diet) Checker</h2>
        <p>Select two food items to test for Ayurvedic incompatibility.</p>
      </div>
      
      <div className="view-body" style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
          {FOODS.map(f => {
            const isSelected = selectedFoods.includes(f.id);
            return (
              <div 
                key={f.id}
                onClick={() => toggleFood(f.id)}
                style={{
                  background: isSelected ? 'var(--primary)' : 'var(--card-bg)',
                  border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: '12px', padding: '20px', textAlign: 'center', cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{f.icon}</div>
                <strong style={{ color: isSelected ? '#fff' : 'inherit' }}>{f.name}</strong>
              </div>
            );
          })}
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ width: '80px', height: '80px', border: '2px dashed var(--border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
              {selectedFoods[0] ? FOODS.find(f => f.id === selectedFoods[0]).icon : '?'}
            </div>
            <span style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>+</span>
            <div style={{ width: '80px', height: '80px', border: '2px dashed var(--border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
              {selectedFoods[1] ? FOODS.find(f => f.id === selectedFoods[1]).icon : '?'}
            </div>
          </div>
          
          <button 
            onClick={checkCombination}
            disabled={selectedFoods.length !== 2}
            className="btn-primary"
            style={{ padding: '15px 30px', fontSize: '1.1rem' }}
          >
            Check Compatibility
          </button>
        </div>

        {result && (
          <div style={{ 
            padding: '25px', borderRadius: '12px', marginTop: '10px',
            background: result.incompatible ? 'rgba(231, 76, 60, 0.1)' : 'rgba(46, 204, 113, 0.1)',
            border: `2px solid ${result.incompatible ? '#e74c3c' : '#2ecc71'}`
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: result.incompatible ? '#e74c3c' : '#2ecc71', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {result.incompatible ? '⚠️ VIRUDDHA (Incompatible)' : '✅ PATHYA (Compatible)'}
            </h3>
            {result.incompatible && (
              <p style={{ margin: '0 0 10px 0' }}><strong>Type:</strong> {result.type}</p>
            )}
            <p style={{ margin: 0, fontSize: '1.1rem', lineHeight: '1.5' }}>
              <strong>Effect:</strong> {result.effect}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
