// server/routes/patients.routes.js
const router = require('express').Router();
const auth   = require('../middleware/auth');
const db     = require('../db');

// GET /api/patients/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const user    = await db('users').where({ id: req.params.id }).first();
    const patient = await db('patients').where({ user_id: req.params.id }).first();
    if (!patient) return res.status(404).json({ success: false, error: 'Patient not found' });
    return res.json({ success: true, data: { ...user, ...patient } });
  } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

// PUT /api/patients/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { dosha_vata, dosha_pitta, dosha_kapha, prakriti, age, gender, dob, blood_group, allergies, mental_health } = req.body;
    await db('patients').where({ user_id: req.params.id }).update({ dosha_vata, dosha_pitta, dosha_kapha, prakriti, age, gender, dob, blood_group, allergies, mental_health });
    return res.json({ success: true });
  } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

// PUT /api/patients/:id/privacy
router.put('/:id/privacy', auth, async (req, res) => {
  try {
    const { privacy_allergies, privacy_treatments, privacy_mental_health, privacy_lab_reports } = req.body;
    await db('patients').where({ user_id: req.params.id }).update({ privacy_allergies, privacy_treatments, privacy_mental_health, privacy_lab_reports });
    return res.json({ success: true });
  } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

// GET /api/patients/:id/full  (doctor view — privacy-filtered)
router.get('/:id/full', auth, async (req, res) => {
  try {
    const user    = await db('users').where({ id: req.params.id }).first();
    const patient = await db('patients').where({ user_id: req.params.id }).first();
    if (!patient) return res.status(404).json({ success: false, error: 'Patient not found' });

    const prescriptions = await db('prescriptions').where({ patient_id: req.params.id });
    const vegaBouts     = await db('vega_bouts').where({ patient_id: req.params.id });

    const record = {
      id: user.id, display_name: user.display_name, email: user.email, phone: user.phone,
      age: patient.age, gender: patient.gender, prakriti: patient.prakriti, blood_group: patient.blood_group,
      priority: patient.priority || 'medium',
      dosha: { vata: patient.dosha_vata, pitta: patient.dosha_pitta, kapha: patient.dosha_kapha },
      allergies:     patient.privacy_allergies     ? patient.allergies     : null,
      mental_health: patient.privacy_mental_health ? patient.mental_health : null,
      lab_reports:   patient.privacy_lab_reports   ? []                    : null,
      prescriptions,
      vega_bouts: vegaBouts,
    };
    return res.json({ success: true, data: record });
  } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

// PATCH /api/patients/:id/priority
router.patch('/:id/priority', auth, async (req, res) => {
  try {
    const { priority } = req.body;
    await db('patients').where({ user_id: req.params.id }).update({ priority });
    return res.json({ success: true, priority });
  } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

module.exports = router;
