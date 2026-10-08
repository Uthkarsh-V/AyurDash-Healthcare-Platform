// server/db.js — Knex PostgreSQL connection
require('dotenv').config();

const knex = require('knex')({
  client: 'pg',
  connection: {
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME     || 'ayurdash',
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },
  pool: { min: 2, max: 10 },
  migrations: { directory: './migrations' },
});

module.exports = knex;
