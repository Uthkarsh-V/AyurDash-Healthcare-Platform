exports.up = (knex) =>
  knex.schema.createTable('medicines', (t) => {
    t.string('id').primary();
    t.string('name').notNullable();
    t.string('type');
    t.text('sanskrit');
    t.text('benefits').defaultTo('[]');
    t.text('dosage');
    t.text('contraindications').defaultTo('[]');
    t.text('dosha_action');
  });

exports.down = (knex) => knex.schema.dropTableIfExists('medicines');
