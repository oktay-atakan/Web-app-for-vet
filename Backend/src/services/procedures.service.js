const proceduresRepository = require('../repositories/procedures.repository');
const petsRepository = require('../repositories/pets.repository');
const usersRepository = require('../repositories/users.repository');
const ApiError = require('../utils/ApiError');

async function assertPetExists(petId) {
  const pet = await petsRepository.findById(petId);
  if (!pet) {
    throw ApiError.badRequest(`Pet ${petId} does not exist`);
  }
}

async function assertPerformedByIsClinical(performedBy) {
  if (performedBy == null) {
    return;
  }
  const user = await usersRepository.findById(performedBy);
  if (!user || !['admin', 'vet'].includes(user.role)) {
    throw ApiError.badRequest('performedBy must reference an active admin or vet user');
  }
}

async function listForPet(petId) {
  await assertPetExists(petId);
  return proceduresRepository.findByPetId(petId);
}

async function getProcedure(id) {
  const procedure = await proceduresRepository.findById(id);
  if (!procedure) {
    throw ApiError.notFound(`Procedure ${id} not found`);
  }
  return procedure;
}

async function createForPet(petId, data) {
  await assertPetExists(petId);
  await assertPerformedByIsClinical(data.performedBy);
  return proceduresRepository.create({ ...data, petId });
}

async function updateProcedure(id, data) {
  const existing = await proceduresRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound(`Procedure ${id} not found`);
  }
  await assertPerformedByIsClinical(data.performedBy);

  return proceduresRepository.update(id, {
    type: data.type ?? existing.type,
    name: data.name ?? existing.name,
    dateAdministered: data.dateAdministered ?? existing.date_administered,
    nextDueDate: data.nextDueDate ?? existing.next_due_date,
    performedBy: data.performedBy ?? existing.performed_by,
    notes: data.notes ?? existing.notes,
  });
}

async function deleteProcedure(id) {
  const existing = await proceduresRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound(`Procedure ${id} not found`);
  }
  await proceduresRepository.remove(id);
}

module.exports = {
  listForPet,
  getProcedure,
  createForPet,
  updateProcedure,
  deleteProcedure,
};