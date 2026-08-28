const customersService = require('../services/customers.service');

async function list(req, res) {
  const customers = await customersService.listCustomers();
  res.json(customers);
}

async function getOne(req, res) {
  const customer = await customersService.getCustomer(req.params.id);
  res.json(customer);
}

async function create(req, res) {
  const { fullName, phone, email, address } = req.body;
  const customer = await customersService.createCustomer({ fullName, phone, email, address });
  res.status(201).json(customer);
}

async function update(req, res) {
  const { fullName, phone, email, address } = req.body;
  const customer = await customersService.updateCustomer(req.params.id, {
    fullName,
    phone,
    email,
    address,
  });
  res.json(customer);
}

async function remove(req, res) {
  await customersService.deleteCustomer(req.params.id);
  res.status(204).send();
}

module.exports = { list, getOne, create, update, remove };