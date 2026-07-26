const usersService = require('../services/users.service');

async function list(req, res) {
  const users = await usersService.listUsers();
  res.json(users);
}

async function getOne(req, res) {
  const user = await usersService.getUser(req.params.id);
  res.json(user);
}

async function create(req, res) {
  const { email, password, fullName, role } = req.body;
  const user = await usersService.createUser({ email, password, fullName, role });
  res.status(201).json(user);
}

async function update(req, res) {
  const { fullName, role, isActive } = req.body;
  const user = await usersService.updateUser(req.params.id, { fullName, role, isActive });
  res.json(user);
}

module.exports = { list, getOne, create, update };