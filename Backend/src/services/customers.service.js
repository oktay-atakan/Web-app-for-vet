const customersRepository = require('../repositories/customers.repository');
const ApiError = require('../utils/ApiError');

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
  return customersRepository.create(data);
}

async function updateCustomer(id, data) {
  const existing = await customersRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound(`Customer ${id} not found`);
  }
  return customersRepository.update(id, {
    fullName: data.fullName ?? existing.full_name,
    phone: data.phone ?? existing.phone,
    email: data.email ?? existing.email,
    address: data.address ?? existing.address,
  });
}

async function deleteCustomer(id) {
  const existing = await customersRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound(`Customer ${id} not found`);
  }

  const hasPets = await customersRepository.hasPets(id);
  if (hasPets) {
    throw ApiError.conflict(`Customer ${id} cannot be deleted while pets are still on file`);
  }

  await customersRepository.remove(id);
}

module.exports = { listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };