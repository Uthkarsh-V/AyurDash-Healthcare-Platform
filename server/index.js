// server/index.js — AyurDash Express Server
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000', 'https://ayurdash.web.app', 'https://ayurdash.netlify.app'], credentials: true }));
app.use(express.json());

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth.routes'));
app.use('/api/patients',      require('./routes/patients.routes'));
app.use('/api/doctors',       require('./routes/doctors.routes'));
app.use('/api/medicines',     require('./routes/medicines.routes'));
app.use('/api/prescriptions', require('./routes/prescriptions.routes'));
app.use('/api/reminders',     require('./routes/reminders.routes'));
app.use('/api/dinacharya',    require('./routes/dinacharya.routes'));
app.use('/api/vegabouts',     require('./routes/vegabouts.routes'));
app.use('/api/chat',          require('./routes/chat.routes'));

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', app: 'AyurDash API', version: '2.0.0' }));

// ── Serve React build in production ───────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (_, res) => res.sendFile(path.join(__dirname, '../client/dist/index.html')));
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🌿 AyurDash API running on http://localhost:${PORT}`));
