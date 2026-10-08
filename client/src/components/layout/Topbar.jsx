// client/src/components/layout/Topbar.jsx
import { useEffect, useState } from 'react';

const TITLES = {
  dinacharya:'🌅 Daily Dashboard', scanner:'📋 AI Prescription Scanner', ritucharya:'🌦 Ritucharya & Weather',
  abhyanga:'💆 Abhyanga Guide', healthid:'🪪 Health ID & Privacy', chat:'💬 AyurCare AI Chat',
  clinical:'🏥 Clinical Hub', vegamonitor:'📊 Vega Bout Monitor', patientlookup:'🔍 Patient Lookup',
  netra:'👁 Netra Tarpana Simulator', poseaudit:'🧪 Pose-Estimation Auditor', vegaclass:'🧬 Vega Bout Classifier',
  viruddha:'⚠️ Viruddha Checker', medicines:'💊 Medicines Directory', watch:'⌚ Smartwatch Reminder Hub',
};

export default function Topbar({ activeView, onNavigate }) {
  const [date, setDate]       = useState('');
  const [weather, setWeather] = useState('🌤 Loading...');

  useEffect(() => {
    const weathers = ['☀️ 32°C Sunny','🌧️ 26°C Rainy','❄️ 18°C Cold','🌤 28°C Partly Cloudy'];
    setWeather(weathers[Math.floor(Math.random() * weathers.length)]);
    const tick = () => setDate(new Date().toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' }));
    tick();
    const t = setInterval(tick, 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="topbar">
      <div className="topbar-title">{TITLES[activeView] || 'AyurDash'}</div>
      <div className="topbar-right">
        <span className="weather-chip">{weather}</span>
        <button className="watch-topbar-btn" onClick={() => onNavigate('watch')} title="Smartwatch Reminders">
          <span className="watch-icon-anim">⌚</span>
        </button>
        <span className="topbar-date">{date}</span>
      </div>
    </div>
  );
}
