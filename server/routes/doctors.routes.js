// server/routes/doctors.routes.js
const router = require('express').Router();
const auth   = require('../middleware/auth');
const db     = require('../db');

// GET /api/doctors/:id/patients
router.get('/:id/patients', auth, async (req, res) => {
  try {
    const rows = await db('prescriptions')
      .where({ doctor_id: req.params.id })
      .distinct('patient_id');
    const patientIds = rows.map(r => r.patient_id);
    if (!patientIds.length) return res.json({ success: true, data: [] });

    const patients = await db('users')
      .join('patients', 'users.id', 'patients.user_id')
      .whereIn('users.id', patientIds)
      .select('users.id','users.display_name','users.email','users.phone',
              'patients.age','patients.prakriti','patients.blood_group',
              'patients.dosha_vata','patients.dosha_pitta','patients.dosha_kapha',
              'patients.privacy_allergies','patients.allergies');
    return res.json({ success: true, data: patients });
  } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

module.exports = router;
