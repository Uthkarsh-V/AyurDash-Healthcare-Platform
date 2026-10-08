exports.up = (knex) =>
  knex.schema.createTable('dinacharya_tasks', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.date('date').notNullable();
    t.integer('task_index').notNullable();
    t.string('task_text');
    t.string('task_time');
    t.boolean('done').defaultTo(false);
    t.unique(['user_id', 'date', 'task_index']);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('dinacharya_tasks');
