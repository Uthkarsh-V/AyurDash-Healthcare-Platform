// client/src/components/layout/Sidebar.jsx
import { useAuth } from '../../context/AuthContext';

const NAV_CONFIG = {
  patient: [
    { section:'Personal Health', items:[
      { id:'dinacharya', icon:'🌅', label:'Daily Dashboard (Dinacharya)' },
      { id:'scanner',    icon:'📋', label:'AI Prescription Scanner' },
      { id:'ritucharya', icon:'🌦', label:'Ritucharya Weather' },
      { id:'abhyanga',   icon:'💆', label:'Abhyanga Camera Guide' },
      { id:'healthid',   icon:'🪪', label:'Health ID & Privacy' },
      { id:'chat',       icon:'💬', label:'AyurCare AI Chat' },
    ]},
    { section:'Reference', items:[{ id:'medicines', icon:'💊', label:'Medicines Directory' }]},
    { section:'Smart Devices', items:[{ id:'watch', icon:'⌚', label:'Smartwatch Reminders' }]},
  ],
  doctor: [
    { section:'Clinical', items:[
      { id:'clinical',      icon:'🏥', label:'Clinical Hub & Rx Designer' },
      { id:'vegamonitor',   icon:'📊', label:'Vega Bout Monitor' },
      { id:'patientlookup', icon:'🔍', label:'Patient Lookup' },
    ]},
    { section:'Reference', items:[{ id:'medicines', icon:'💊', label:'Medicines Directory' }]},
    { section:'Smart Devices', items:[{ id:'watch', icon:'⌚', label:'Smartwatch Reminders' }]},
  ],
  student: [
    { section:'Training Lab', items:[
      { id:'netra',     icon:'👁',  label:'Netra Tarpana Simulator' },
      { id:'poseaudit', icon:'🧪', label:'Abhyanga Pose Auditor' },
      { id:'vegaclass', icon:'🧬', label:'Vega Bout Classifier' },
      { id:'viruddha',  icon:'⚠️', label:'Viruddha Checker' },
    ]},
    { section:'Reference', items:[{ id:'medicines', icon:'💊', label:'Medicines Directory' }]},
  ],
};

export default function Sidebar({ portal, activeView, onNavigate }) {
  const { user, logout } = useAuth();
  const role = portal === 'patient' ? 'Patient' : portal === 'doctor' ? 'Physician' : 'Student';

  return (
    <aside className="sidebar open" id="sidebar">
      <div className="sidebar-header">
        <span className="logo-leaf">🌿</span>
        <span className="sidebar-brand">AyurDash</span>
      </div>
      <div className="user-chip">
        <div className="uc-name">{user?.display_name || user?.email}</div>
        <div className="uc-role">{role}</div>
      </div>
      <nav className="sidebar-nav">
        {(NAV_CONFIG[portal] || []).map(section => (
          <div key={section.section} className="nav-section">
            <div className="nav-section-label">{section.section}</div>
            {section.items.map(item => (
              <button key={item.id} className={`nav-item${activeView === item.id ? ' active' : ''}`} onClick={() => onNavigate(item.id)}>
                <span className="nav-icon">{item.icon}</span>{item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <button className="logout-btn" onClick={logout}>🚪 Sign Out</button>
    </aside>
  );
}
