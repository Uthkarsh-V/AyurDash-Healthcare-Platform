// client/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import DashPage from './pages/DashPage';

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">🌿 Loading AyurDash...</div>;
  return (
    <Routes>
      <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" replace />} />
      <Route path="/*"    element={ user ? <DashPage /> : <Navigate to="/auth" replace />} />
    </Routes>
  );
}
