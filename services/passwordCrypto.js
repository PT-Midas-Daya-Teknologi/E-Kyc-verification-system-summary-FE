import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 10;

/**
 * Hash password with bcrypt before sending to /authenticate.
 * Backend decrypts DB password (AES) and validates via BCrypt.checkpw.
 * Spring jBCrypt expects $2a$; bcryptjs emits $2b$ — normalize prefix.
 */
export function hashPasswordForAuth(plainPassword) {
  const salt = bcrypt.genSaltSync(BCRYPT_ROUNDS);
  const hash = bcrypt.hashSync(plainPassword, salt);
  return hash.startsWith('$2b$') ? `$2a$${hash.slice(4)}` : hash;
}
