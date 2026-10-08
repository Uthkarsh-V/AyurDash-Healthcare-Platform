// server/routes/auth.routes.js
const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../db');

const sign = (user) =>
  jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'ayurdash_jwt_secret',
    { expiresIn: '7d' }
  );

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, display_name, phone,
            specialization, experience, reg_number, institution, student_code } = req.body;
    if (!email || !password || !role)
      return res.status(400).json({ success: false, error: 'email, password and role are required' });

    const exists = await db('users').where({ email }).first();
    if (exists) return res.status(409).json({ success: false, error: 'Email already registered' });

    const password_hash = bcrypt.hashSync(password, 10);
    const [user] = await db('users')
      .insert({ email, password_hash, role, display_name, phone })
      .returning('*');

    // Create role-specific profile
    if (role === 'patient') {
      await db('patients').insert({ user_id: user.id });
    } else if (role === 'doctor') {
      await db('doctors').insert({ user_id: user.id, specialization, experience, reg_number });
    } else if (role === 'student') {
      await db('students').insert({ user_id: user.id, institution, student_code });
    }

    return res.json({ success: true, token: sign(user), user: { id: user.id, email: user.email, role: user.role, display_name: user.display_name } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db('users').where({ email }).first();
    if (!user || !bcrypt.compareSync(password, user.password_hash))
      return res.status(401).json({ success: false, error: 'Invalid email or password' });

    return res.json({ success: true, token: sign(user), user: { id: user.id, email: user.email, role: user.role, display_name: user.display_name } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/auth/me
const auth = require('../middleware/auth');
router.get('/me', auth, async (req, res) => {
  try {
    const user = await db('users').where({ id: req.user.id }).first();
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    const { password_hash, ...safe } = user;
    return res.json({ success: true, data: safe });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
