const proceduresService = require('../services/procedures.service');

async function listForPet(req, res) {
  const procedures = await proceduresService.listForPet(req.params.petId);
  res.json(procedures);
}

async function createForPet(req, res) {
  const { type, name, dateAdministered, nextDueDate, performedBy, notes } = req.body;
  const procedure = await proceduresService.createForPet(req.params.petId, {
    type,
    name,
    dateAdministered,
    nextDueDate,
    performedBy,
    notes,
  });
  res.status(201).json(procedure);
}

async function update(req, res) {
  const { type, name, dateAdministered, nextDueDate, performedBy, notes } = req.body;
  const procedure = await proceduresService.updateProcedure(req.params.id, {
    type,
    name,
    dateAdministered,
    nextDueDate,
    performedBy,
    notes,
  });
  res.json(procedure);
}

async function remove(req, res) {
  await proceduresService.deleteProcedure(req.params.id);
  res.status(204).send();
}

module.exports = { listForPet, createForPet, update, remove };