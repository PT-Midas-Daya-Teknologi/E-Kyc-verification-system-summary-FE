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
  'SELECT email, password, length(password) AS len FROM admin_user ORDER BY email'
);
console.log(rows);
await client.end();
