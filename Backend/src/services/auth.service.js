const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const usersRepository = require('../repositories/users.repository');
const ApiError = require('../utils/ApiError');

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
  };
}

async function login(email, password) {
  const user = await usersRepository.findByEmail(email);

  if (!user || !user.is_active) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });

  return { token, user: toPublicUser(user) };
}

module.exports = { login, toPublicUser };
