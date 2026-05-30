import pg from 'pg';

const client = new pg.Client({
  host: 'localhost',
  port: 5432,
  database: 'xyz_mall',
  user: 'postgres',
  password: 'root',
});

await client.connect();
const { rows } = await client.query(
  'SELECT id, email, password, is_active FROM admin_user WHERE email = $1',
  ['admin@admin.com']
);
console.log(rows);
await client.end();
