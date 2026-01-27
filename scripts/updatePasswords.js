require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gestionactivosti'
};

async function updatePasswords() {
    const connection = await mysql.createConnection(dbConfig);
    const [users] = await connection.execute('SELECT id, contrasena FROM usuario');
    
    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.contrasena, 10);
        await connection.execute('UPDATE usuario SET contrasena = ? WHERE id = ?', [hashedPassword, user.id]);
        console.log(`Contraseña actualizada para usuario ${user.id}`);
    }
    
    await connection.end();
    console.log('Proceso completado');
}

updatePasswords().catch(console.error);
