const { Client } = require('pg');

const client = new Client({
  host: 'hiresense-db.czokg66egydx.ap-south-1.rds.amazonaws.com',
  user: 'postgres',
  password: 'Ajya27092005',
  port: 5432,
  database: 'postgres'
});

async function run() {
  await client.connect();
  console.log('Connected to default postgres database.');
  try {
    await client.query('CREATE DATABASE hiresense;');
    console.log('Successfully created database "hiresense"');
  } catch (err) {
    console.error('Error creating database:', err);
  } finally {
    await client.end();
  }
}

run();
