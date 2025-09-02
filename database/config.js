const { Pool } = require('pg');
require( 'dotenv' ).config();

const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: 'terranovi',
  password: process.env.PASSWORD,    
  port: 5432
});

async function probarConexion() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log("La hora actual en el servidor PostgreSQL es:", res.rows[0].now);
    
  } catch (err) {
    console.error('Ocurrió un error al conectar a PostgreSQL:', err);
  }
}

module.exports = {
    probarConexion,
    pool
}