const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config/jwt');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username y contraseña son obligatorios' });
  }

  const query = 'CALL BuscarUsuarioPorUsername(?)';

  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error('❌ Error al verificar usuario:', err);
      return res.status(500).json({ success: false, message: 'Error en el servidor' });
    }

    const userResults = results[0];

    if (userResults.length === 0) {
      return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }

    const user = userResults[0];
    try {
      const match = await bcrypt.compare(password, user.contrasena);
      if (!match) {
        return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, isAdmin: user.administrador },
        SECRET_KEY,
        { expiresIn: '60m' }
      );

      res.json({ success: true, message: 'Login exitoso', token });

    } catch (error) {
      console.error('❌ Error al procesar login:', error);
      res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
  });
});


router.get('/logout', (req, res) => {
    // Con JWT, el logout se maneja en el cliente eliminando el token
    res.json({ success: true, message: 'Sesión cerrada (elimine el token en el cliente)' });
});

module.exports = router;