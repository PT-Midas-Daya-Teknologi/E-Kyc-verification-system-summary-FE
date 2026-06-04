import bcrypt from 'bcryptjs';
import axios from 'axios';

function hashPasswordForAuth(plainPassword) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(plainPassword, salt);
  return hash.startsWith('$2b$') ? `$2a$${hash.slice(4)}` : hash;
}
const base = 'http://localhost:8081/openapi/dev';
const password = hashPasswordForAuth('admin123');
const login = await axios.post(`${base}/authenticate`, {
  username: 'admin@admin.com',
  password,
}, { withCredentials: true });


const token = login.data.body.accessToken;
console.log('login ok, token length:', token.length);
const summary = await axios.post(
  `${base}/dashboard/summary`,
  { page: 0, size: 10 },
  {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  }
);
console.log('summary status:', summary.status);
console.log('users:', summary.data?.body?.data?.length ?? summary.data);
