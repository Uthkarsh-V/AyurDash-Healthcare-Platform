// server/routes/medicines.routes.js
const router = require('express').Router();
const auth   = require('../middleware/auth');
const db     = require('../db');

// GET /api/medicines
router.get('/', auth, async (req, res) => {
  try {
    const meds = await db('medicines').select('*');
    return res.json({ success: true, data: meds });
  } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

// GET /api/medicines/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const med = await db('medicines').where({ id: req.params.id }).first();
    if (!med) return res.status(404).json({ success: false, error: 'Medicine not found' });
    return res.json({ success: true, data: med });
  } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

module.exports = router;
