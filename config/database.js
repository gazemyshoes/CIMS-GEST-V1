require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test de conexión (opcional pero útil)
pool.getConnection()
  .then(connection => {
    console.log('✅ Conectado a la base de datos:', process.env.DB_NAME);
    connection.release();
  })
  .catch(err => {
    console.error('❌ Error conectando a la BD:', err);
  });

module.exports = pool;
