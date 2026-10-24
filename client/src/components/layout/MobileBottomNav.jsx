// client/src/components/layout/MobileBottomNav.jsx
import React from 'react';

const TABS_BY_PORTAL = {
  doctor: [
    { id: 'clinical', icon: '🏥', label: 'Clinical' },
    { id: 'vegamonitor', icon: '📊', label: 'Vega' },
    { id: 'patientlookup', icon: '🔍', label: 'Lookup' },
    { id: 'watch', icon: '⌚', label: 'Watch' },
  ],
  patient: [
    { id: 'dinacharya', icon: '🌅', label: 'Routine' },
    { id: 'scanner', icon: '📋', label: 'Scanner' },
    { id: 'chat', icon: '💬', label: 'AI Chat' },
    { id: 'watch', icon: '⌚', label: 'Watch' },
  ],
  student: [
    { id: 'shastrakarma', icon: '🔪', label: 'Shastra' },
    { id: 'netra', icon: '👁', label: 'Netra' },
    { id: 'viruddha', icon: '⚠️', label: 'Viruddha' },
    { id: 'watch', icon: '⌚', label: 'Watch' },
  ]
};

export default function MobileBottomNav({ portal, activeView, onNavigate, onOpenMenu }) {
  const tabs = TABS_BY_PORTAL[portal] || TABS_BY_PORTAL.patient;

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
      {tabs.map(tab => {
        const isActive = activeView === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            className={`mob-nav-btn ${isActive ? 'active' : ''}`}
            onClick={() => onNavigate(tab.id)}
            aria-label={tab.label}
          >
            <span className="mob-nav-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}

      {/* Menu / Drawer button */}
      <button
        type="button"
        className="mob-nav-btn"
        onClick={onOpenMenu}
        aria-label="Open Full Navigation Menu"
      >
        <span className="mob-nav-icon">☰</span>
        <span>Menu</span>
      </button>
    </nav>
  );
}
