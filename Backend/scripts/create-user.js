const { parseArgs } = require('node:util');
const bcrypt = require('bcryptjs');
const env = require('../src/config/env');
const pool = require('../src/config/db');
const usersRepository = require('../src/repositories/users.repository');

const VALID_ROLES = ['admin', 'vet', 'staff'];

async function main() {
  const { values } = parseArgs({
    options: {
      email: { type: 'string' },
      password: { type: 'string' },
      fullName: { type: 'string' },
      role: { type: 'string' },
    },
  });

  const { email, password, fullName, role } = values;

  if (!email || !password || !fullName || !role) {
    console.error(
      'Usage: node scripts/create-user.js --email=<email> --password=<password> --fullName="<name>" --role=<admin|vet|staff>'
    );
    process.exitCode = 1;
    return;
  }

  if (!VALID_ROLES.includes(role)) {
    console.error(`Invalid role "${role}". Must be one of: ${VALID_ROLES.join(', ')}`);
    process.exitCode = 1;
    return;
  }

  const alreadyExists = await usersRepository.emailExists(email);
  if (alreadyExists) {
    console.error(`A user with email "${email}" already exists.`);
    process.exitCode = 1;
    return;
  }

  const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds);
  const user = await usersRepository.create({ email, passwordHash, fullName, role });

  console.log(`Created user #${user.id}: ${user.email} (${user.role})`);
}

main()
  .catch((err) => {
    console.error('Failed to create user:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());