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

// GET /api/reminders/patient/:patientId
router.get('/patient/:patientId', auth, async (req, res) => {
  try {
    const rows = await db('reminders').where({ user_id: req.params.patientId }).orderBy('time');
    return res.json({ success: true, data: rows });
  } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

// POST /api/reminders
router.post('/', auth, async (req, res) => {
  try {
    const { label, note, time, repeat, priority, alert_browser, alert_watch, alert_sound, source, med_id, patient_id, user_id } = req.body;
    const targetUserId = patient_id || user_id || req.user.id;
    const doctorPrefix = req.user.role === 'doctor' ? `Dr. ${req.user.display_name || 'Physician'}` : 'manual';
    const [row] = await db('reminders')
      .insert({
        user_id: targetUserId,
        label,
        note,
        time,
        repeat: repeat || 'daily',
        priority: priority || 'medium',
        alert_browser: alert_browser !== undefined ? alert_browser : true,
        alert_watch: alert_watch !== undefined ? alert_watch : true,
        alert_sound: alert_sound !== undefined ? alert_sound : true,
        source: source || doctorPrefix,
        med_id
      })
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
