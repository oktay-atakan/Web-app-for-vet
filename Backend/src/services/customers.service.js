const customersRepository = require('../repositories/customers.repository');
const ApiError = require('../utils/ApiError');
const resolveOptionalField = require('../utils/resolveOptionalField');

async function listCustomers() {
  return customersRepository.findAll();
}

async function getCustomer(id) {
  const customer = await customersRepository.findById(id);
  if (!customer) {
    throw ApiError.notFound(`Customer ${id} not found`);
  }
  return customer;
}

async function createCustomer(data) {
  return customersRepository.create({
    ...data,
    phone: data.phone || null,
    email: data.email || null,
    address: data.address || null,
  });
}

async function updateCustomer(id, data) {
  const existing = await customersRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound(`Customer ${id} not found`);
  }
  return customersRepository.update(id, {
    fullName: data.fullName ?? existing.full_name,
    phone: resolveOptionalField(data.phone, existing.phone),
    email: resolveOptionalField(data.email, existing.email),
    address: resolveOptionalField(data.address, existing.address),
  });
}

async function deleteCustomer(id) {
  const existing = await customersRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound(`Customer ${id} not found`);
  }

  const [hasPets, hasAppointments] = await Promise.all([
    customersRepository.hasPets(id),
    customersRepository.hasAppointments(id),
  ]);
  if (hasPets || hasAppointments) {
    throw ApiError.conflict(
      `Customer "${existing.full_name}" cannot be deleted while pets or appointments are still on file`
    );
  }

  await customersRepository.remove(id);
}

module.exports = { listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };