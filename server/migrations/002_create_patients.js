exports.up = (knex) =>
  knex.schema.createTable('patients', (t) => {
    t.uuid('user_id').primary().references('id').inTable('users').onDelete('CASCADE');
    t.integer('age');
    t.string('gender');
    t.date('dob');
    t.string('prakriti');
    t.string('blood_group');
    t.text('allergies').defaultTo('[]');
    t.text('mental_health');
    t.integer('dosha_vata').defaultTo(33);
    t.integer('dosha_pitta').defaultTo(33);
    t.integer('dosha_kapha').defaultTo(34);
    t.boolean('privacy_allergies').defaultTo(true);
    t.boolean('privacy_treatments').defaultTo(true);
    t.boolean('privacy_mental_health').defaultTo(false);
    t.boolean('privacy_lab_reports').defaultTo(true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('patients');
