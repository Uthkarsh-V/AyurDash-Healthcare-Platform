// server/db.js — Knex SQLite connection
require('dotenv').config();

const path = require('path');

const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: path.resolve(__dirname, 'ayurdash.sqlite3')
  },
  useNullAsDefault: true,
  migrations: { directory: path.resolve(__dirname, 'migrations') },
});

module.exports = knex;
