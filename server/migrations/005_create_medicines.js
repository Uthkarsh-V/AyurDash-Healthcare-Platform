exports.up = (knex) =>
  knex.schema.createTable('medicines', (t) => {
    t.string('id').primary();
    t.string('name').notNullable();
    t.string('type');
    t.text('sanskrit');
    t.specificType('benefits', 'TEXT[]').defaultTo('{}');
    t.text('dosage');
    t.specificType('contraindications', 'TEXT[]').defaultTo('{}');
    t.text('dosha_action');
  });

exports.down = (knex) => knex.schema.dropTableIfExists('medicines');
