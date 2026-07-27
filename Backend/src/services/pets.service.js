const petsRepository = require('../repositories/pets.repository');
const customersRepository = require('../repositories/customers.repository');
const proceduresRepository = require('../repositories/procedures.repository');
const ApiError = require('../utils/ApiError');
const resolveOptionalField = require('../utils/resolveOptionalField');

async function assertCustomerExists(customerId) {
  const customer = await customersRepository.findById(customerId);
  if (!customer) {
    throw ApiError.badRequest(`Customer ${customerId} does not exist`);
  }
}

async function listPets({ customerId } = {}) {
  return petsRepository.findAll({ customerId });
}

async function getPet(id, role) {
  const pet = await petsRepository.findById(id);
  if (!pet) {
    throw ApiError.notFound(`Pet ${id} not found`);
  }

  // Staff get demographic fields only; procedure history is clinical data,
  // reserved for admin/vet.
  if (role === 'staff') {
    return pet;
  }
  const procedures = await proceduresRepository.findByPetId(id);
  return { ...pet, procedures };
}

async function createPet(data) {
  await assertCustomerExists(data.customerId);
  return petsRepository.create({
    ...data,
    breed: data.breed || null,
    birthDate: data.birthDate || null,
    weightKg: data.weightKg || null,
    notes: data.notes || null,
  });
}

async function updatePet(id, data) {
  const existing = await petsRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound(`Pet ${id} not found`);
  }
  return petsRepository.update(id, {
    name: data.name ?? existing.name,
    species: data.species ?? existing.species,
    breed: resolveOptionalField(data.breed, existing.breed),
    birthDate: resolveOptionalField(data.birthDate, existing.birth_date),
    weightKg: resolveOptionalField(data.weightKg, existing.weight_kg),
    notes: resolveOptionalField(data.notes, existing.notes),
  });
}

async function deletePet(id) {
  const existing = await petsRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound(`Pet ${id} not found`);
  }

  const [hasProcedures, hasAppointments] = await Promise.all([
    petsRepository.hasProcedures(id),
    petsRepository.hasAppointments(id),
  ]);
  if (hasProcedures || hasAppointments) {
    throw ApiError.conflict(`Pet ${id} cannot be deleted while it has procedure or appointment history`);
  }

  await petsRepository.remove(id);
}

module.exports = { listPets, getPet, createPet, updatePet, deletePet };