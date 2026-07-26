const bcrypt = require('bcryptjs');
const env = require('../config/env');
const usersRepository = require('../repositories/users.repository');
const ApiError = require('../utils/ApiError');

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    isActive: Boolean(user.is_active),
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

async function listUsers() {
  const users = await usersRepository.findAll();
  return users.map(toPublicUser);
}

async function getUser(id) {
  const user = await usersRepository.findById(id);
  if (!user) {
    throw ApiError.notFound(`User ${id} not found`);
  }
  return toPublicUser(user);
}

async function createUser({ email, password, fullName, role }) {
  const alreadyExists = await usersRepository.emailExists(email);
  if (alreadyExists) {
    throw ApiError.conflict(`A user with email "${email}" already exists`);
  }

  const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds);
  const user = await usersRepository.create({ email, passwordHash, fullName, role });
  return toPublicUser(user);
}

async function updateUser(id, { fullName, role, isActive }) {
  const existing = await usersRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound(`User ${id} not found`);
  }

  const user = await usersRepository.update(id, {
    fullName: fullName ?? existing.full_name,
    role: role ?? existing.role,
    isActive: isActive ?? Boolean(existing.is_active),
  });
  return toPublicUser(user);
}

module.exports = { listUsers, getUser, createUser, updateUser, toPublicUser };