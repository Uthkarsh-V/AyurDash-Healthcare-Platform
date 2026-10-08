// client/src/components/layout/Toast.jsx
import { useEffect, useState } from 'react';

export default function Toast({ msg, type = 'info' }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => { const t = setTimeout(() => setVisible(false), 3500); return () => clearTimeout(t); }, []);
  if (!visible) return null;
  return <div className={`toast type-${type}`}>{msg}</div>;
}
