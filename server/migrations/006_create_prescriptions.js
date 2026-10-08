exports.up = (knex) =>
  knex.schema.createTable('prescriptions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('doctor_id').references('id').inTable('users');
    t.uuid('patient_id').references('id').inTable('users');
    t.string('medicine_id').references('id').inTable('medicines');
    t.string('medicine_name');
    t.text('dosage');
    t.string('routine').defaultTo('daily');
    t.text('notes');
    t.boolean('active').defaultTo(true);
    t.timestamp('prescribed_at').defaultTo(knex.fn.now());
  });

exports.down = (knex) => knex.schema.dropTableIfExists('prescriptions');
