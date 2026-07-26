const pool = require('../config/db');

async function findByPetId(petId) {
  const [rows] = await pool.execute(
    'SELECT * FROM procedures WHERE pet_id = ? ORDER BY date_administered DESC, id DESC',
    [petId]
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute('SELECT * FROM procedures WHERE id = ?', [id]);
  return rows[0] || null;
}

async function create({ petId, type, name, dateAdministered, nextDueDate, performedBy, notes }) {
  const [result] = await pool.execute(
    'INSERT INTO procedures (pet_id, type, name, date_administered, next_due_date, performed_by, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [petId, type, name, dateAdministered, nextDueDate ?? null, performedBy ?? null, notes ?? null]
  );
  return findById(result.insertId);
}

async function update(id, { type, name, dateAdministered, nextDueDate, performedBy, notes }) {
  await pool.execute(
    'UPDATE procedures SET type = ?, name = ?, date_administered = ?, next_due_date = ?, performed_by = ?, notes = ? WHERE id = ?',
    [type, name, dateAdministered, nextDueDate ?? null, performedBy ?? null, notes ?? null, id]
  );
  return findById(id);
}

async function remove(id) {
  await pool.execute('DELETE FROM procedures WHERE id = ?', [id]);
}

module.exports = { findByPetId, findById, create, update, remove };