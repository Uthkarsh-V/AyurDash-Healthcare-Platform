// server/routes/chat.routes.js
const router = require('express').Router();
const auth   = require('../middleware/auth');
const db     = require('../db');

// GET /api/chat/:userId  (last 100 messages)
router.get('/:userId', auth, async (req, res) => {
  try {
    const rows = await db('chat_history')
      .where({ user_id: req.params.userId })
      .orderBy('created_at', 'asc')
      .limit(100);
    return res.json({ success: true, data: rows });
  } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

// POST /api/chat
router.post('/', auth, async (req, res) => {
  try {
    const { user_id, role, message } = req.body;
    const [row] = await db('chat_history').insert({ user_id, role, message }).returning('*');
    return res.json({ success: true, data: row });
  } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

module.exports = router;
