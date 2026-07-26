const pool = require('../config/db');

async function findAll({ customerId } = {}) {
  if (customerId) {
    const [rows] = await pool.execute(
      'SELECT * FROM pets WHERE customer_id = ? ORDER BY id ASC',
      [customerId]
    );
    return rows;
  }
  const [rows] = await pool.execute('SELECT * FROM pets ORDER BY id ASC');
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute('SELECT * FROM pets WHERE id = ?', [id]);
  return rows[0] || null;
}

async function create({ customerId, name, species, breed, birthDate, weightKg, notes }) {
  const [result] = await pool.execute(
    'INSERT INTO pets (customer_id, name, species, breed, birth_date, weight_kg, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [customerId, name, species, breed ?? null, birthDate ?? null, weightKg ?? null, notes ?? null]
  );
  return findById(result.insertId);
}

async function update(id, { name, species, breed, birthDate, weightKg, notes }) {
  await pool.execute(
    'UPDATE pets SET name = ?, species = ?, breed = ?, birth_date = ?, weight_kg = ?, notes = ? WHERE id = ?',
    [name, species, breed ?? null, birthDate ?? null, weightKg ?? null, notes ?? null, id]
  );
  return findById(id);
}

async function remove(id) {
  await pool.execute('DELETE FROM pets WHERE id = ?', [id]);
}

async function hasProcedures(id) {
  const [rows] = await pool.execute('SELECT id FROM procedures WHERE pet_id = ? LIMIT 1', [id]);
  return rows.length > 0;
}

async function hasAppointments(id) {
  const [rows] = await pool.execute('SELECT id FROM appointments WHERE pet_id = ? LIMIT 1', [id]);
  return rows.length > 0;
}

module.exports = { findAll, findById, create, update, remove, hasProcedures, hasAppointments };