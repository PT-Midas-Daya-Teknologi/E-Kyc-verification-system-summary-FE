import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const secretKey = 'e-kyc-secret-key';
const ivKey = 'e-kyc-iv-key';
function decryptAes(encryptedData) {
  const key = Buffer.from(secretKey, 'utf8');
  const iv = Buffer.from(ivKey, 'utf8');
  const data = Buffer.from(encryptedData, 'base64');
  const tag = data.subarray(data.length - 16);
  const ciphertext = data.subarray(0, data.length - 16);
  const decipher = crypto.createDecipheriv('aes-128-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}
const dbPassword = 'as3fafm6OfXaUtnp7vLERO2OvUj2RD6o';
const plain = decryptAes(dbPassword);
const requestHash = bcrypt.hashSync('admin123', 10);
console.log('decrypted:', plain);
console.log('bcrypt check:', bcrypt.compareSync(plain, requestHash));
