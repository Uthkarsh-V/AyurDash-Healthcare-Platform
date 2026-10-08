// client/src/components/patient/AyurChat.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api';
import { chatKnowledge } from '../../data/ayurdb';

function matchKnowledge(msg) {
  const lower = msg.toLowerCase();
  for (const entry of chatKnowledge) {
    if (entry.keywords.some(k => lower.includes(k))) return entry.response;
  }
  return "Namaste! I understand your concern. For personalized advice, please consult your physician. I can help with general Ayurvedic diet queries, medication reminders, and wellness tips. Could you describe your concern in more detail?";
}

export default function AyurChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([{ role:'bot', message:'Namaste! 🙏 I\'m AyurCare AI, your 24/7 Ayurvedic wellness assistant. Ask me anything about diet, medications, or wellness.' }]);
  const [input, setInput]       = useState('');
  const [typing, setTyping]     = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    api.getChatHistory(user.id).then(rows => { if (rows?.length) setMessages(rows); }).catch(() => {});
  }, [user]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, typing]);

  function send(msg) {
    if (!msg.trim()) return;
    const userMsg = { role:'user', message: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    if (user) api.saveChat({ user_id: user.id, role:'user', message: msg }).catch(() => {});
    setTimeout(() => {
      const botReply = { role:'bot', message: matchKnowledge(msg) };
      setTyping(false);
      setMessages(prev => [...prev, botReply]);
      if (user) api.saveChat({ user_id: user.id, role:'bot', message: botReply.message }).catch(() => {});
    }, 1200);
  }

  function escalate() {
    send('🚨 EMERGENCY — I need immediate help!');
  }

  return (
    <section className="view">
      <h2 className="view-title">💬 AyurCare AI Chat</h2>
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role}`}>
              <span className="chat-avatar">{m.role === 'bot' ? '🌿' : '🧘'}</span>
              <div className="chat-bubble">{m.message}</div>
            </div>
          ))}
          {typing && <div className="chat-msg bot"><span className="chat-avatar">🌿</span><div className="chat-bubble"><div className="typing-dots"><span/><span/><span/></div></div></div>}
          <div ref={bottomRef} />
        </div>
        <div className="chat-input-bar">
          <input type="text" className="form-input" placeholder="Type your question..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(input)} />
          <button className="btn btn-primary" onClick={() => send(input)}>Send ➤</button>
          <button className="btn btn-danger" onClick={escalate}>🚨 Emergency</button>
        </div>
      </div>
    </section>
  );
}
