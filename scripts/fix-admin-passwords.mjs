import pg from 'pg';

const { Client } = pg;

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'root',
});
await client.connect();

await client.query(
  "UPDATE admin_user SET password = $1 WHERE email = $2",
  ['e8jBc+DkeaKweAtibTzxVImeZdRSoULY', 'admin@example.com']
);
await client.query(
  "UPDATE admin_user SET password = $1 WHERE email = $2",
  ['as3fafm6OfXaUtnp7vLERO2OvUj2RD6o', 'admin@admin.com']
);

const { rows } = await client.query('SELECT email, password FROM admin_user ORDER BY email');
console.log(rows);
await client.end();
