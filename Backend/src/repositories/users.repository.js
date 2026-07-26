const pool = require('../config/db');

const SAFE_FIELDS = 'id, email, full_name, role, is_active, created_at, updated_at';

async function findByEmail(email) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.execute(`SELECT ${SAFE_FIELDS} FROM users WHERE id = ?`, [id]);
  return rows[0] || null;
}

async function findAll() {
  const [rows] = await pool.execute(`SELECT ${SAFE_FIELDS} FROM users ORDER BY id ASC`);
  return rows;
}

async function emailExists(email) {
  const [rows] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
  return rows.length > 0;
}

async function create({ email, passwordHash, fullName, role }) {
  const [result] = await pool.execute(
    'INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
    [email, passwordHash, fullName, role]
  );
  return findById(result.insertId);
}

async function update(id, { fullName, role, isActive }) {
  await pool.execute('UPDATE users SET full_name = ?, role = ?, is_active = ? WHERE id = ?', [
    fullName,
    role,
    isActive,
    id,
  ]);
  return findById(id);
}

module.exports = { findByEmail, findById, findAll, emailExists, create, update };