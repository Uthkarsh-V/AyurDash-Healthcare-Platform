// client/src/components/patient/Ritucharya.jsx
import { useState } from 'react';
import { ritucharya } from '../../data/ayurdb';

const WEATHER_MAP = { sunny:{ icon:'☀️', temp:'34°C', desc:'Hot & Sunny — Pitta Season Active', season:'Grishma' }, rain:{ icon:'🌧️', temp:'25°C', desc:'Heavy Monsoon Rain — Vata Aggravation Alert', season:'Varsha' }, cold:{ icon:'❄️', temp:'16°C', desc:'Cold Snap — Vata & Kapha Season', season:'Shishira' }, humid:{ icon:'🌫️', temp:'30°C', desc:'Humid & Muggy — Kapha Alert', season:'Varsha' } };

export default function Ritucharya() {
  const [weather, setWeather] = useState('sunny');
  const cfg    = WEATHER_MAP[weather];
  const season = ritucharya[cfg.season];

  return (
    <section className="view">
      <h2 className="view-title">🌦 Ritucharya — Seasonal & Weather Adaptation</h2>
      <div className="grid-2">
        <div className="card weather-main-card">
          <div className="weather-display-icon">{cfg.icon}</div>
          <div className="weather-temp">{cfg.temp}</div>
          <div className="weather-desc">{cfg.desc}</div>
          <div className="mt-16">
            <label className="form-label">Simulate Weather Condition</label>
            <div className="weather-sim-btns">
              {[['sunny','☀️ Hot & Sunny'],['rain','🌧️ Heavy Rain'],['cold','❄️ Cold Snap'],['humid','🌫️ Humid']].map(([k,l]) => (
                <button key={k} className={`btn btn-outline${weather===k?' active':''}`} onClick={() => setWeather(k)}>{l}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="card">
          <h3>{season.season_icon} {season.name}</h3>
          <span className="season-badge">{season.months}</span>
          <p className="muted mt-8">Dominant Dosha: <strong>{season.dominant_dosha}</strong></p>
          <p className="muted mt-8">Digestive Fire (Agni): <em>{season.agni}</em></p>
          <p className="mt-8"><strong>Recommended Herbs:</strong> {season.herbs.join(', ')}</p>
        </div>
      </div>
      <div className="grid-2 mt-16">
        <div className="card"><h3>✅ Recommended Today</h3><div className="tag-list">{[...season.diet.recommended,...season.lifestyle.recommended].map((item,i)=><span key={i} className="tag">{item}</span>)}</div></div>
        <div className="card"><h3>🚫 Avoid Today</h3><div className="tag-list avoid">{[...season.diet.avoid,...season.lifestyle.avoid].map((item,i)=><span key={i} className="tag">{item}</span>)}</div></div>
      </div>
    </section>
  );
}
