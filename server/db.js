// server/db.js — Knex SQLite connection
require('dotenv').config();

const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './ayurdash.sqlite3'
  },
  useNullAsDefault: true,
  migrations: { directory: './migrations' },
});

module.exports = knex;
