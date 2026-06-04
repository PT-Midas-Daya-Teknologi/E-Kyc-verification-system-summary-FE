import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 10;
export function hashPasswordForAuth(plainPassword) {
  const salt = bcrypt.genSaltSync(BCRYPT_ROUNDS);
  const hash = bcrypt.hashSync(plainPassword, salt);
  return hash.startsWith('$2b$') ? `$2a$${hash.slice(4)}` : hash;
}
