// server/routes/prescriptions.routes.js
const router = require('express').Router();
const auth   = require('../middleware/auth');
const db     = require('../db');

// POST /api/prescriptions
router.post('/', auth, async (req, res) => {
  try {
    const { patient_id, medicine_id, medicine_name, dosage, routine, notes } = req.body;
    const [rx] = await db('prescriptions')
      .insert({ doctor_id: req.user.id, patient_id, medicine_id, medicine_name, dosage, routine, notes })
      .returning('*');
    return res.json({ success: true, data: rx });
  } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

// GET /api/prescriptions/patient/:patientId
router.get('/patient/:patientId', auth, async (req, res) => {
  try {
    const rows = await db('prescriptions').where({ patient_id: req.params.patientId });
    return res.json({ success: true, data: rows });
  } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

// GET /api/prescriptions/doctor/:doctorId
router.get('/doctor/:doctorId', auth, async (req, res) => {
  try {
    const rows = await db('prescriptions').where({ doctor_id: req.params.doctorId });
    return res.json({ success: true, data: rows });
  } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

module.exports = router;
