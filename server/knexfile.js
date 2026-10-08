module.exports = {
  client: 'sqlite3',
  connection: {
    filename: './ayurdash.sqlite3'
  },
  useNullAsDefault: true,
  migrations: { directory: './migrations' },
  seeds: { directory: './seeds' }
};
