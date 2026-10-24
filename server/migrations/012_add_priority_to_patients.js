// server/migrations/012_add_priority_to_patients.js
exports.up = async function(knex) {
  const hasCol = await knex.schema.hasColumn('patients', 'priority');
  if (!hasCol) {
    await knex.schema.alterTable('patients', t => {
      t.string('priority').defaultTo('medium');
    });
  }
};

exports.down = async function(knex) {
  const hasCol = await knex.schema.hasColumn('patients', 'priority');
  if (hasCol) {
    await knex.schema.alterTable('patients', t => {
      t.dropColumn('priority');
    });
  }
};
