// server/routes/vegabouts.routes.js
const router = require('express').Router();
const auth   = require('../middleware/auth');
const db     = require('../db');

// POST /api/vegabouts
router.post('/', auth, async (req, res) => {
  try {
    const { patient_id, therapy, bout_time, bout_number, volume, color, consistency, notes } = req.body;
    const [row] = await db('vega_bouts')
      .insert({ doctor_id: req.user.id, patient_id, therapy, bout_time, bout_number, volume, color, consistency, notes })
      .returning('*');
    return res.json({ success: true, data: row });
  } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

// GET /api/vegabouts/:patientId
router.get('/:patientId', auth, async (req, res) => {
  try {
    const rows = await db('vega_bouts').where({ patient_id: req.params.patientId }).orderBy('logged_at');
    return res.json({ success: true, data: rows });
  } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

module.exports = router;
