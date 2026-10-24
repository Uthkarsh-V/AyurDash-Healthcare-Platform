// client/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../api';

const AuthContext = createContext(null);

export const DEMO_USERS = {
  patient: { id: 'P001', role: 'patient', display_name: 'Arjun Sharma', email: 'arjun@ayurdash.com', phone: '+91-9876543210' },
  doctor:  { id: 'D001', role: 'doctor',  display_name: 'Dr. Meera Nair', email: 'meera@ayurdash.com', phone: '+91-9000000001' },
  student: { id: 'S001', role: 'student', display_name: 'Aditya Rao',     email: 'aditya@ayurdash.com', phone: '+91-9000000002' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('ayurdash_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch(e) { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('ayurdash_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.getMe()
        .then(u => {
          setUser(u);
          try { localStorage.setItem('ayurdash_user', JSON.stringify(u)); } catch(e) {}
        })
        .catch(() => {
          // If offline / on GitHub Pages static mode, keep saved user
          const saved = localStorage.getItem('ayurdash_user');
          if (saved) {
            try { setUser(JSON.parse(saved)); } catch(e) {}
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.login(email, password);
      localStorage.setItem('ayurdash_token', res.token);
      localStorage.setItem('ayurdash_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } catch (err) {
      // Offline / GitHub Pages fallback
      const foundDemo = Object.values(DEMO_USERS).find(u => u.email === email) ||
        (email.includes('doctor') || email.includes('meera') ? DEMO_USERS.doctor :
         email.includes('student') || email.includes('aditya') ? DEMO_USERS.student : DEMO_USERS.patient);

      const fakeToken = 'offline_token_' + Date.now();
      localStorage.setItem('ayurdash_token', fakeToken);
      localStorage.setItem('ayurdash_user', JSON.stringify(foundDemo));
      setToken(fakeToken);
      setUser(foundDemo);
      return foundDemo;
    }
  };

  const loginAsDemo = (roleKey = 'patient') => {
    const demo = DEMO_USERS[roleKey] || DEMO_USERS.patient;
    const fakeToken = 'demo_token_' + Date.now();
    localStorage.setItem('ayurdash_token', fakeToken);
    localStorage.setItem('ayurdash_user', JSON.stringify(demo));
    setToken(fakeToken);
    setUser(demo);
    return demo;
  };

  const register = async (body) => {
    try {
      const res = await api.register(body);
      localStorage.setItem('ayurdash_token', res.token);
      localStorage.setItem('ayurdash_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } catch (err) {
      const newUser = {
        id: 'u_' + Date.now(),
        email: body.email,
        role: body.role || 'patient',
        display_name: body.display_name || body.email.split('@')[0],
        phone: body.phone || ''
      };
      const fakeToken = 'reg_token_' + Date.now();
      localStorage.setItem('ayurdash_token', fakeToken);
      localStorage.setItem('ayurdash_user', JSON.stringify(newUser));
      setToken(fakeToken);
      setUser(newUser);
      return newUser;
    }
  };

  const logout = () => {
    localStorage.removeItem('ayurdash_token');
    localStorage.removeItem('ayurdash_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginAsDemo, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
