exports.up = (knex) =>
  knex.schema.createTable('students', (t) => {
    t.uuid('user_id').primary().references('id').inTable('users').onDelete('CASCADE');
    t.string('institution');
    t.string('student_code');
  });

exports.down = (knex) => knex.schema.dropTableIfExists('students');
