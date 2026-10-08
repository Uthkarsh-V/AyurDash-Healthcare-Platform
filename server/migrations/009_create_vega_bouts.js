exports.up = (knex) =>
  knex.schema.createTable('vega_bouts', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.uuid('doctor_id').references('id').inTable('users');
    t.uuid('patient_id').references('id').inTable('users');
    t.string('therapy');
    t.string('bout_time');
    t.integer('bout_number');
    t.string('volume');
    t.string('color');
    t.string('consistency');
    t.text('notes');
    t.timestamp('logged_at').defaultTo(knex.fn.now());
  });

exports.down = (knex) => knex.schema.dropTableIfExists('vega_bouts');
