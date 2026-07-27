const mysql = require('mysql2/promise');
const env = require('./env');

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  // Return DATE/DATETIME/TIMESTAMP columns as raw strings instead of JS Date
  // objects — avoids a local-timezone round-trip that shifted dates by a day
  // (server timezone is UTC+3; Date objects serialize to JSON as UTC).
  dateStrings: true,
});

module.exports = pool;