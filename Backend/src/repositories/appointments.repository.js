const pool = require('../config/db');

async function findAll({ status, customerId } = {}) {
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (customerId) {
    conditions.push('customer_id = ?');
    params.push(customerId);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.execute(
    `SELECT * FROM appointments ${where} ORDER BY scheduled_at ASC`,
    params
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute('SELECT * FROM appointments WHERE id = ?', [id]);
  return rows[0] || null;
}

async function create({ customerId, petId, scheduledAt, status, reason, assignedTo }) {
  const [result] = await pool.execute(
    'INSERT INTO appointments (customer_id, pet_id, scheduled_at, status, reason, assigned_to) VALUES (?, ?, ?, ?, ?, ?)',
    [customerId, petId ?? null, scheduledAt, status ?? 'scheduled', reason ?? null, assignedTo ?? null]
  );
  return findById(result.insertId);
}

async function update(id, { petId, scheduledAt, status, reason, assignedTo }) {
  await pool.execute(
    'UPDATE appointments SET pet_id = ?, scheduled_at = ?, status = ?, reason = ?, assigned_to = ? WHERE id = ?',
    [petId ?? null, scheduledAt, status, reason ?? null, assignedTo ?? null, id]
  );
  return findById(id);
}

async function remove(id) {
  await pool.execute('DELETE FROM appointments WHERE id = ?', [id]);
}

module.exports = { findAll, findById, create, update, remove };