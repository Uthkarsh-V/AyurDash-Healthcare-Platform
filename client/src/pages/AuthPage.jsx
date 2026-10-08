// client/src/pages/AuthPage.jsx — replaces auth.html + auth.js
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [screen, setScreen]     = useState('role');
  const [role,   setRole]       = useState('');
  const [email,  setEmail]      = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [phone, setPhone]         = useState('');
  const [spec,  setSpec]          = useState('');
  const [institution, setInstitution] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const roleLabels = { patient: { icon:'🧘', label:'Patient', sub:'Personal Health Portal' }, doctor: { icon:'🩺', label:'Physician', sub:'Clinical Hub' }, student: { icon:'📚', label:'Student', sub:'Training Lab' } };

  async function handleLogin(e) {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(email, password); navigate('/'); }
    catch(err) { setError(err.response?.data?.error || 'Login failed'); }
    finally { setLoading(false); }
  }

  async function handleRegister(e) {
    e.preventDefault(); setError(''); setLoading(true);
    if (password !== confirmPw) { setError('Passwords do not match'); setLoading(false); return; }
    try {
      await register({ email, password, role, display_name: `${firstName} ${lastName}`.trim(), phone: `+91-${phone}`, specialization: spec, institution, student_code: studentCode });
      navigate('/');
    } catch(err) { setError(err.response?.data?.error || 'Registration failed'); }
    finally { setLoading(false); }
  }

  if (screen === 'role') return (
    <div className="auth-body">
      <div className="auth-split">
        <div className="auth-left">
          <div className="auth-left-content">
            <div className="auth-logo"><span className="logo-leaf">🌿</span><span className="auth-brand">AyurDash</span></div>
            <h1 className="auth-headline">Ancient Wisdom.<br/>Modern Care.</h1>
            <p className="auth-subline">The complete Ayurvedic platform for patients, physicians, and students.</p>
            <div className="auth-features">
              <div className="auth-feat"><span>🧘</span><span>Personalized Dinacharya & Dosha tracking</span></div>
              <div className="auth-feat"><span>🩺</span><span>Clinical prescription & Panchakarma management</span></div>
              <div className="auth-feat"><span>📚</span><span>Interactive training labs for Ayurvedic students</span></div>
              <div className="auth-feat"><span>⌚</span><span>Smartwatch medication reminders</span></div>
            </div>
          </div>
        </div>
        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-card-logo"><span className="logo-leaf">🌿</span><span className="auth-brand-sm">AyurDash</span></div>
            <h2 className="auth-card-title">Welcome</h2>
            <p className="auth-card-sub">Select your role to continue</p>
            <div className="role-grid">
              {['patient','doctor','student'].map(r => (
                <button key={r} className="role-card" onClick={() => { setRole(r); setScreen('login'); }}>
                  <span className="role-icon">{roleLabels[r].icon}</span>
                  <span className="role-name">{roleLabels[r].label}</span>
                  <span className="role-desc">{roleLabels[r].sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (screen === 'login') return (
    <div className="auth-body">
      <div className="auth-right" style={{ width:'100%', maxWidth:'480px', margin:'0 auto' }}>
        <div className="auth-card">
          <button className="back-btn" onClick={() => setScreen('role')}>← Back</button>
          <h2 className="auth-card-title">Sign In as {roleLabels[role]?.label}</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
            <div className="form-group"><label className="form-label">Password</label><input type="password" className="form-input" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
            {error && <div className="auth-error">{error}</div>}
            <button type="submit" className="btn btn-primary btn-full mt-12" disabled={loading}>{loading ? 'Signing in...' : 'Sign In →'}</button>
          </form>
          <p className="auth-switch-text">Don't have an account? <button className="link-btn" onClick={() => setScreen('signup')}>Create Account</button></p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="auth-body">
      <div className="auth-right" style={{ width:'100%', maxWidth:'480px', margin:'0 auto' }}>
        <div className="auth-card">
          <button className="back-btn" onClick={() => setScreen('login')}>← Back</button>
          <h2 className="auth-card-title">Create Account</h2>
          <form onSubmit={handleRegister}>
            <div className="form-row-2">
              <div className="form-group"><label className="form-label">First Name</label><input className="form-input" value={firstName} onChange={e=>setFirstName(e.target.value)} required /></div>
              <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" value={lastName} onChange={e=>setLastName(e.target.value)} required /></div>
            </div>
            <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={phone} onChange={e=>setPhone(e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Password</label><input type="password" className="form-input" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
            <div className="form-group"><label className="form-label">Confirm Password</label><input type="password" className="form-input" value={confirmPw} onChange={e=>setConfirmPw(e.target.value)} required /></div>
            {role === 'doctor' && <div className="form-group"><label className="form-label">Specialization</label><input className="form-input" value={spec} onChange={e=>setSpec(e.target.value)} /></div>}
            {role === 'student' && <>
              <div className="form-group"><label className="form-label">Institution</label><input className="form-input" value={institution} onChange={e=>setInstitution(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Student ID</label><input className="form-input" value={studentCode} onChange={e=>setStudentCode(e.target.value)} /></div>
            </>}
            {error && <div className="auth-error">{error}</div>}
            <button type="submit" className="btn btn-primary btn-full mt-12" disabled={loading}>{loading ? 'Creating...' : 'Create Account →'}</button>
          </form>
          <p className="auth-switch-text">Already have an account? <button className="link-btn" onClick={() => setScreen('login')}>Sign In</button></p>
        </div>
      </div>
    </div>
  );
}
