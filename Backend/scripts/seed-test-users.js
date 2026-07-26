const bcrypt = require('bcryptjs');
const env = require('../src/config/env');
const pool = require('../src/config/db');
const usersRepository = require('../src/repositories/users.repository');

// Convenience seed for manual/Postman testing — creates one user per role
// with a known password. Safe to re-run: existing emails are skipped.
const TEST_USERS = [
  { email: 'admin@vetapp.local', password: 'Admin123!', fullName: 'Test Admin', role: 'admin' },
  { email: 'vet@vetapp.local', password: 'Vet123!', fullName: 'Test Vet', role: 'vet' },
  { email: 'staff@vetapp.local', password: 'Staff123!', fullName: 'Test Staff', role: 'staff' },
];

async function main() {
  for (const testUser of TEST_USERS) {
    const alreadyExists = await usersRepository.emailExists(testUser.email);
    if (alreadyExists) {
      console.log(`Skipped (already exists): ${testUser.email}`);
      continue;
    }

    const passwordHash = await bcrypt.hash(testUser.password, env.bcryptSaltRounds);
    const user = await usersRepository.create({ ...testUser, passwordHash });
    console.log(`Created user #${user.id}: ${user.email} (${user.role}) — password: ${testUser.password}`);
  }
}

main()
  .catch((err) => {
    console.error('Failed to seed test users:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());