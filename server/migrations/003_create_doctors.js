exports.up = (knex) =>
  knex.schema.createTable('doctors', (t) => {
    t.uuid('user_id').primary().references('id').inTable('users').onDelete('CASCADE');
    t.string('specialization');
    t.string('experience');
    t.string('reg_number');
  });

exports.down = (knex) => knex.schema.dropTableIfExists('doctors');
