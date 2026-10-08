// 011_seed_static_data.js
const bcrypt = require('bcryptjs');

exports.seed = async function (knex) {
  // ── Medicines ──────────────────────────────────────────────
  await knex('medicines').del();
  await knex('medicines').insert([
    { id: 'M001', name: 'Ashwagandha Churna',  type: 'Churna',            sanskrit: 'Withania somnifera',                                           benefits: ['Reduces stress & anxiety','Boosts immunity','Improves sleep quality','Enhances strength'],          dosage: '3–5g with warm milk at bedtime',                          contraindications: ['Pregnancy','Hyperthyroidism'],              dosha_action: 'Vata-pacifying, Kapha-increasing' },
    { id: 'M002', name: 'Triphala Churna',     type: 'Churna',            sanskrit: 'Terminalia chebula + Terminalia bellirica + Phyllanthus emblica', benefits: ['Digestive tonic','Gentle laxative','Antioxidant','Eye health'],                                  dosage: '3–6g with warm water before bed',                         contraindications: ['Diarrhea','Dehydration'],                   dosha_action: 'Tridosha-balancing' },
    { id: 'M003', name: 'Brahmi Taila',        type: 'Taila (Oil)',        sanskrit: 'Bacopa monnieri',                                              benefits: ['Memory enhancement','Scalp nourishment','Reduces mental fatigue','Promotes hair growth'],              dosage: 'Apply 5–10ml warm oil to scalp, leave 30 min before bath', contraindications: ['Open wounds on scalp'],                     dosha_action: 'Vata-pacifying, Pitta-pacifying' },
    { id: 'M004', name: 'Trikatu Churna',      type: 'Churna',            sanskrit: 'Zingiber officinale + Piper nigrum + Piper longum',             benefits: ['Ignites Agni (digestive fire)','Clears Kapha','Reduces obesity','Clears sinuses'],                  dosage: '1–3g with honey before meals',                            contraindications: ['Pitta disorders','Peptic ulcer','Pregnancy'], dosha_action: 'Kapha-reducing, Vata-reducing' },
    { id: 'M005', name: 'Dashamoola Kashaya', type: 'Kashaya (Decoction)', sanskrit: 'Ten roots formulation',                                        benefits: ['Anti-inflammatory','Relieves Vata disorders','Post-natal care','Fever management'],                   dosage: '30–60ml twice daily before food',                         contraindications: ['Constipation without Vata imbalance'],     dosha_action: 'Vata-pacifying' },
    { id: 'M006', name: 'Mahanarayan Taila',  type: 'Taila (Oil)',        sanskrit: 'Classical poly-herbal oil',                                    benefits: ['Joint pain relief','Muscle stiffness','Paralysis recovery','Arthritis management'],                  dosage: 'Warm application over joints, followed by steam therapy', contraindications: ['Fresh injuries','Open wounds'],             dosha_action: 'Vata-pacifying' },
    { id: 'M007', name: 'Shankhapushpi Syrup',type: 'Syrup',              sanskrit: 'Convolvulus pluricaulis',                                      benefits: ['Memory booster','Reduces anxiety','Improves concentration','Mild sedative'],                         dosage: '10–15ml with equal water twice daily',                    contraindications: ['Excessive Kapha'],                          dosha_action: 'Vata-pacifying, Pitta-pacifying' },
  ]);

  // ── Demo Users ─────────────────────────────────────────────
  const hash = (pw) => bcrypt.hashSync(pw, 10);
  await knex('users').del();

  const [patientUser] = await knex('users').insert([
    { email: 'arjun@ayurdash.com',  password_hash: hash('demo1234'), role: 'patient', display_name: 'Arjun Sharma',  phone: '+91-9876543210' },
  ]).returning('*');

  const [doctorUser] = await knex('users').insert([
    { email: 'meera@ayurdash.com',  password_hash: hash('demo1234'), role: 'doctor',  display_name: 'Dr. Meera Nair', phone: '+91-9000000001' },
  ]).returning('*');

  await knex('users').insert([
    { email: 'aditya@ayurdash.com', password_hash: hash('demo1234'), role: 'student', display_name: 'Aditya Rao',     phone: '+91-9000000002' },
  ]);

  // ── Demo Patient Profile ───────────────────────────────────
  await knex('patients').del();
  await knex('patients').insert({
    user_id:              patientUser.id,
    age:                  34,
    gender:               'Male',
    dob:                  '1990-03-15',
    prakriti:             'Vata-Pitta',
    blood_group:          'B+',
    allergies:            ['Milk at night', 'Heavy oils post-sunset'],
    mental_health:        'Mild anxiety reported during exam seasons. Recommended Shankhapushpi.',
    dosha_vata:           42,
    dosha_pitta:          35,
    dosha_kapha:          23,
    privacy_allergies:    true,
    privacy_treatments:   true,
    privacy_mental_health:false,
    privacy_lab_reports:  true,
  });

  // ── Demo Doctor Profile ────────────────────────────────────
  await knex('doctors').del();
  await knex('doctors').insert({
    user_id:        doctorUser.id,
    specialization: 'Panchakarma & Rasayana',
    experience:     '14 years',
    reg_number:     'MCI-2024-0001',
  });

  console.log('✅ Seed complete — medicines, demo patient, doctor, student inserted');
};
