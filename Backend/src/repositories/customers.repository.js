const pool = require('../config/db');

async function findAll() {
  const [rows] = await pool.execute('SELECT * FROM customers ORDER BY id ASC');
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute('SELECT * FROM customers WHERE id = ?', [id]);
  return rows[0] || null;
}

async function create({ fullName, phone, email, address }) {
  const [result] = await pool.execute(
    'INSERT INTO customers (full_name, phone, email, address) VALUES (?, ?, ?, ?)',
    [fullName, phone ?? null, email ?? null, address ?? null]
  );
  return findById(result.insertId);
}

async function update(id, { fullName, phone, email, address }) {
  await pool.execute(
    'UPDATE customers SET full_name = ?, phone = ?, email = ?, address = ? WHERE id = ?',
    [fullName, phone ?? null, email ?? null, address ?? null, id]
  );
  return findById(id);
}

async function remove(id) {
  await pool.execute('DELETE FROM customers WHERE id = ?', [id]);
}

async function hasPets(id) {
  const [rows] = await pool.execute('SELECT id FROM pets WHERE customer_id = ? LIMIT 1', [id]);
  return rows.length > 0;
}

module.exports = { findAll, findById, create, update, remove, hasPets };