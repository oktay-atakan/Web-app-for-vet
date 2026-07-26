const appointmentsRepository = require('../repositories/appointments.repository');
const customersRepository = require('../repositories/customers.repository');
const petsRepository = require('../repositories/pets.repository');
const usersRepository = require('../repositories/users.repository');
const ApiError = require('../utils/ApiError');

async function assertCustomerExists(customerId) {
  const customer = await customersRepository.findById(customerId);
  if (!customer) {
    throw ApiError.badRequest(`Customer ${customerId} does not exist`);
  }
}

async function assertPetBelongsToCustomer(petId, customerId) {
  if (petId == null) {
    return;
  }
  const pet = await petsRepository.findById(petId);
  if (!pet) {
    throw ApiError.badRequest(`Pet ${petId} does not exist`);
  }
  if (pet.customer_id !== customerId) {
    throw ApiError.badRequest(`Pet ${petId} does not belong to customer ${customerId}`);
  }
}

async function assertAssignedToIsClinical(assignedTo) {
  if (assignedTo == null) {
    return;
  }
  const user = await usersRepository.findById(assignedTo);
  if (!user || !['admin', 'vet'].includes(user.role)) {
    throw ApiError.badRequest('assignedTo must reference an active admin or vet user');
  }
}

async function listAppointments(filters) {
  return appointmentsRepository.findAll(filters);
}

async function getAppointment(id) {
  const appointment = await appointmentsRepository.findById(id);
  if (!appointment) {
    throw ApiError.notFound(`Appointment ${id} not found`);
  }
  return appointment;
}

async function createAppointment(data) {
  await assertCustomerExists(data.customerId);
  await assertPetBelongsToCustomer(data.petId, data.customerId);
  await assertAssignedToIsClinical(data.assignedTo);
  return appointmentsRepository.create(data);
}

async function updateAppointment(id, data) {
  const existing = await appointmentsRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound(`Appointment ${id} not found`);
  }

  const petId = data.petId ?? existing.pet_id;
  const assignedTo = data.assignedTo ?? existing.assigned_to;
  await assertPetBelongsToCustomer(petId, existing.customer_id);
  await assertAssignedToIsClinical(assignedTo);

  return appointmentsRepository.update(id, {
    petId,
    scheduledAt: data.scheduledAt ?? existing.scheduled_at,
    status: data.status ?? existing.status,
    reason: data.reason ?? existing.reason,
    assignedTo,
  });
}

async function deleteAppointment(id) {
  const existing = await appointmentsRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound(`Appointment ${id} not found`);
  }
  await appointmentsRepository.remove(id);
}

module.exports = {
  listAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};