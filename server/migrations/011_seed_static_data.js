// 011_seed_static_data.js
const bcrypt = require('bcryptjs');

exports.up = async function (knex) {
  // ── Medicines ──────────────────────────────────────────────
  await knex('medicines').del();
  await knex('medicines').insert([
    { id: 'M001', name: 'Ashwagandha Churna', type: 'Churna', sanskrit: 'Withania somnifera', benefits: JSON.stringify(['Reduces stress & anxiety', 'Boosts immunity', 'Improves sleep quality', 'Enhances strength']), dosage: '3–5g with warm milk at bedtime', contraindications: JSON.stringify(['Pregnancy', 'Hyperthyroidism']), dosha_action: 'Vata-pacifying, Kapha-increasing' },
    { id: 'M002', name: 'Triphala Churna', type: 'Churna', sanskrit: 'Terminalia chebula + Terminalia bellirica + Phyllanthus emblica', benefits: JSON.stringify(['Digestive tonic', 'Gentle laxative', 'Antioxidant', 'Eye health']), dosage: '3–6g with warm water before bed', contraindications: JSON.stringify(['Diarrhea', 'Dehydration']), dosha_action: 'Tridosha-balancing' },
    { id: 'M003', name: 'Brahmi Taila', type: 'Taila (Oil)', sanskrit: 'Bacopa monnieri', benefits: JSON.stringify(['Memory enhancement', 'Scalp nourishment', 'Reduces mental fatigue', 'Promotes hair growth']), dosage: 'Apply 5–10ml warm oil to scalp, leave 30 min before bath', contraindications: JSON.stringify(['Open wounds on scalp']), dosha_action: 'Vata-pacifying, Pitta-pacifying' },
    { id: 'M004', name: 'Trikatu Churna', type: 'Churna', sanskrit: 'Zingiber officinale + Piper nigrum + Piper longum', benefits: JSON.stringify(['Ignites Agni (digestive fire)', 'Clears Kapha', 'Reduces obesity', 'Clears sinuses']), dosage: '1–3g with honey before meals', contraindications: JSON.stringify(['Pitta disorders', 'Peptic ulcer', 'Pregnancy']), dosha_action: 'Kapha-reducing, Vata-reducing' },
    { id: 'M005', name: 'Dashamoola Kashaya', type: 'Kashaya (Decoction)', sanskrit: 'Ten roots formulation', benefits: JSON.stringify(['Anti-inflammatory', 'Relieves Vata disorders', 'Post-natal care', 'Fever management']), dosage: '30–60ml twice daily before food', contraindications: JSON.stringify(['Constipation without Vata imbalance']), dosha_action: 'Vata-pacifying' },
    { id: 'M006', name: 'Mahanarayan Taila', type: 'Taila (Oil)', sanskrit: 'Classical poly-herbal oil', benefits: JSON.stringify(['Joint pain relief', 'Muscle stiffness', 'Paralysis recovery', 'Arthritis management']), dosage: 'Warm application over joints, followed by steam therapy', contraindications: JSON.stringify(['Fresh injuries', 'Open wounds']), dosha_action: 'Vata-pacifying' },
    { id: 'M007', name: 'Shankhapushpi Syrup', type: 'Syrup', sanskrit: 'Convolvulus pluricaulis', benefits: JSON.stringify(['Memory booster', 'Reduces anxiety', 'Improves concentration', 'Mild sedative']), dosage: '10–15ml with equal water twice daily', contraindications: JSON.stringify(['Excessive Kapha']), dosha_action: 'Vata-pacifying, Pitta-pacifying' },
  ]);

  // ── Demo Users ─────────────────────────────────────────────
  const hash = (pw) => bcrypt.hashSync(pw, 10);
  await knex('users').del();

  const [patientUser1] = await knex('users').insert([
    { email: 'arjun@ayurdash.com', password_hash: hash('demo1234'), role: 'patient', display_name: 'Arjun Sharma', phone: '+91-9876543210' },
  ]).returning('*');

  const [patientUser2] = await knex('users').insert([
    { email: 'priya@ayurdash.com', password_hash: hash('demo1234'), role: 'patient', display_name: 'Priya Venkatesh', phone: '+91-9123456789' },
  ]).returning('*');

  const [patientUser3] = await knex('users').insert([
    { email: 'kavita@ayurdash.com', password_hash: hash('demo1234'), role: 'patient', display_name: 'Kavita Sundaram', phone: '+91-9845012345' },
  ]).returning('*');

  const [patientUser4] = await knex('users').insert([
    { email: 'rajesh@ayurdash.com', password_hash: hash('demo1234'), role: 'patient', display_name: 'Rajesh Nair', phone: '+91-9741234567' },
  ]).returning('*');

  const [doctorUser] = await knex('users').insert([
    { email: 'meera@ayurdash.com', password_hash: hash('demo1234'), role: 'doctor', display_name: 'Dr. Meera Nair', phone: '+91-9000000001' },
  ]).returning('*');

  await knex('users').insert([
    { email: 'aditya@ayurdash.com', password_hash: hash('demo1234'), role: 'student', display_name: 'Aditya Rao', phone: '+91-9000000002' },
  ]);

  // ── Demo Patients with Priority ────────────────────────────
  await knex('patients').del();
  await knex('patients').insert([
    {
      user_id: patientUser1.id,
      age: 34,
      gender: 'Male',
      dob: '1990-03-15',
      prakriti: 'Vata-Pitta',
      blood_group: 'B+',
      priority: 'high',
      allergies: JSON.stringify(['Milk at night', 'Heavy oils post-sunset']),
      mental_health: 'Mild anxiety reported during exam seasons. Recommended Shankhapushpi.',
      dosha_vata: 42,
      dosha_pitta: 35,
      dosha_kapha: 23,
      privacy_allergies: true,
      privacy_treatments: true,
      privacy_mental_health: false,
      privacy_lab_reports: true,
    },
    {
      user_id: patientUser2.id,
      age: 28,
      gender: 'Female',
      dob: '1996-07-22',
      prakriti: 'Kapha-Vata',
      blood_group: 'O+',
      priority: 'critical',
      allergies: JSON.stringify(['Sesame (external heat rash)']),
      mental_health: 'Post-Virechana monitoring. Severe dehydration risk.',
      dosha_vata: 30,
      dosha_pitta: 25,
      dosha_kapha: 45,
      privacy_allergies: true,
      privacy_treatments: true,
      privacy_mental_health: true,
      privacy_lab_reports: true,
    },
    {
      user_id: patientUser3.id,
      age: 42,
      gender: 'Female',
      dob: '1982-11-04',
      prakriti: 'Pitta-Kapha',
      blood_group: 'A+',
      priority: 'medium',
      allergies: JSON.stringify(['Sour citrus']),
      mental_health: 'Stable. Active shamana therapy for knee joint stiffness.',
      dosha_vata: 25,
      dosha_pitta: 45,
      dosha_kapha: 30,
      privacy_allergies: true,
      privacy_treatments: true,
      privacy_mental_health: true,
      privacy_lab_reports: true,
    },
    {
      user_id: patientUser4.id,
      age: 50,
      gender: 'Male',
      dob: '1974-05-19',
      prakriti: 'Sama-Tridosha',
      blood_group: 'AB+',
      priority: 'low',
      allergies: JSON.stringify([]),
      mental_health: 'Good vitality. Preventive Rasayana regimen.',
      dosha_vata: 33,
      dosha_pitta: 34,
      dosha_kapha: 33,
      privacy_allergies: true,
      privacy_treatments: true,
      privacy_mental_health: true,
      privacy_lab_reports: true,
    }
  ]);

  // ── Demo Doctor Profile ────────────────────────────────────
  await knex('doctors').del();
  await knex('doctors').insert({
    user_id: doctorUser.id,
    specialization: 'Panchakarma & Rasayana',
    experience: '14 years',
    reg_number: 'MCI-2024-0001',
  });

  console.log('✅ Seed complete — medicines, demo patients with clinical priority, doctor, student inserted');
};

exports.down = async function (knex) {
  await knex('doctors').del();
  await knex('patients').del();
  await knex('users').del();
  await knex('medicines').del();
};
