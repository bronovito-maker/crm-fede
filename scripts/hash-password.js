const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Uso: node scripts/hash-password.js <password>');
  process.exit(1);
}

const rounds = Number(process.env.BCRYPT_ROUNDS || 12);
const hash = bcrypt.hashSync(password, rounds);

console.log(hash);
