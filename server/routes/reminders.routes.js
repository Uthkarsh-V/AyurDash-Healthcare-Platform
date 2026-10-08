// server/routes/reminders.routes.js
const router = require('express').Router();
const auth   = require('../middleware/auth');
const db     = require('../db');

// GET /api/reminders/:userId
router.get('/:userId', auth, async (req, res) => {
  try {
    const rows = await db('reminders').where({ user_id: req.params.userId }).orderBy('time');
    return res.json({ success: true, data: rows });
  } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

// POST /api/reminders
router.post('/', auth, async (req, res) => {
  try {
    const { label, note, time, repeat, priority, alert_browser, alert_watch, alert_sound, source, med_id } = req.body;
    const [row] = await db('reminders')
      .insert({ user_id: req.user.id, label, note, time, repeat, priority, alert_browser, alert_watch, alert_sound, source, med_id })
      .returning('*');
    return res.json({ success: true, data: row });
  } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

// PATCH /api/reminders/:id/status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status, taken_at, snoozed_until } = req.body;
    await db('reminders').where({ id: req.params.id }).update({ status, taken_at, snoozed_until, updated_at: db.fn.now() });
    return res.json({ success: true });
  } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

// DELETE /api/reminders/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await db('reminders').where({ id: req.params.id }).del();
    return res.json({ success: true });
  } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

module.exports = router;
