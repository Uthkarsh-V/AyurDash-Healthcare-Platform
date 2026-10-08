exports.up = (knex) =>
  knex.schema.createTable('reminders', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('label').notNullable();
    t.text('note');
    t.string('time').notNullable();
    t.string('repeat').defaultTo('daily');
    t.string('priority').defaultTo('medium');
    t.boolean('alert_browser').defaultTo(true);
    t.boolean('alert_watch').defaultTo(true);
    t.boolean('alert_sound').defaultTo(true);
    t.string('status').defaultTo('pending');
    t.boolean('sent_to_watch').defaultTo(false);
    t.string('source').defaultTo('manual');
    t.string('med_id').references('id').inTable('medicines');
    t.string('taken_at');
    t.string('snoozed_until');
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('reminders');
