// client/src/pages/DashPage.jsx — main app shell
import { useState, useCallback } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Topbar  from '../components/layout/Topbar';
import MobileBottomNav from '../components/layout/MobileBottomNav';
import Modal   from '../components/layout/Modal';
import Toast   from '../components/layout/Toast';
import { useAuth } from '../context/AuthContext';

// Patient views
import Dinacharya          from '../components/patient/Dinacharya';
import PrescriptionScanner from '../components/patient/PrescriptionScanner';
import Ritucharya          from '../components/patient/Ritucharya';
import AbhyangaGuide       from '../components/patient/AbhyangaGuide';
import HealthId            from '../components/patient/HealthId';
import AyurChat            from '../components/patient/AyurChat';
// Doctor views
import ClinicalHub   from '../components/doctor/ClinicalHub';
import VegaMonitor   from '../components/doctor/VegaMonitor';
import PatientLookup from '../components/doctor/PatientLookup';
// Student views
import NetraSimulator  from '../components/student/NetraSimulator';
import PoseAuditor     from '../components/student/PoseAuditor';
import VegaClassifier  from '../components/student/VegaClassifier';
import ViruddhaChecker from '../components/student/ViruddhaChecker';
import ShastraKarmaSimulator from '../components/student/ShastraKarmaSimulator';
import MarmaSimulator from '../components/student/MarmaSimulator';
// Shared views
import MedicinesDirectory from '../components/shared/MedicinesDirectory';
import WatchHub           from '../components/shared/WatchHub';

const VIEW_MAP = {
  dinacharya:    <Dinacharya />,
  scanner:       <PrescriptionScanner />,
  ritucharya:    <Ritucharya />,
  abhyanga:      <AbhyangaGuide />,
  healthid:      <HealthId />,
  chat:          <AyurChat />,
  clinical:      <ClinicalHub />,
  vegamonitor:   <VegaMonitor />,
  patientlookup: <PatientLookup />,
  netra:         <NetraSimulator />,
  poseaudit:     <PoseAuditor />,
  vegaclass:     <VegaClassifier />,
  viruddha:      <ViruddhaChecker />,
  shastrakarma:  <ShastraKarmaSimulator />,
  marmapoints:   <MarmaSimulator />,
  medicines:     <MedicinesDirectory />,
  watch:         <WatchHub />,
};

const DEFAULT_VIEW = { patient:'dinacharya', doctor:'clinical', student:'netra' };

export default function DashPage() {
  const { user } = useAuth();
  const portal = user?.role || 'patient';
  const [activeView, setActiveView]   = useState(DEFAULT_VIEW[portal] || 'dinacharya');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal]             = useState(null);
  const [toast, setToast]             = useState(null);

  const showToast = useCallback((msg, type='info') => {
    setToast({ msg, type, key: Date.now() });
  }, []);

  const openModal  = useCallback((html) => setModal(html), []);
  const closeModal = useCallback(() => setModal(null), []);

  const handleNavigate = (view) => {
    setActiveView(view);
    setSidebarOpen(false);
  };

  return (
    <div className="main-app">
      {/* Backdrop overlay for mobile drawer */}
      <div
        className={`sidebar-backdrop ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <Sidebar
        portal={portal}
        activeView={activeView}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <Topbar
        portal={portal}
        activeView={activeView}
        onNavigate={handleNavigate}
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
      />

      <main className="content-area">
        {VIEW_MAP[activeView] || <div className="view"><p>View not found</p></div>}
      </main>

      {/* Mobile-only Bottom Quick Navigation */}
      <MobileBottomNav
        portal={portal}
        activeView={activeView}
        onNavigate={handleNavigate}
        onOpenMenu={() => setSidebarOpen(true)}
      />

      {modal && <Modal content={modal} onClose={closeModal} />}
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} />}
    </div>
  );
}
