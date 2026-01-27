const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

// Obtener todos los usuarios
router.get('/usuarios', (req, res) => {
    db.query('CALL sp_obtener_usuarios()', (err, results) => {
        if (err) {
            console.error('❌ Error al obtener usuarios:', err);
            return res.status(500).json({ error: 'Error al obtener usuarios' });
        }
        res.status(200).json(results[0]);
    });
});

// Obtener usuarios no administradores
router.get('/usuarios/noadmin', (req, res) => {
    db.query('CALL sp_obtener_usuarios_no_admin()', (err, results) => {
        if (err) {
            console.error('❌ Error al obtener usuarios no administradores:', err);
            return res.status(500).json({ error: 'Error al obtener usuarios no administradores' });
        }
        res.status(200).json(results[0]);
    });
});

// Obtener un usuario por correo
router.get('/usuarios/:correo', (req, res) => {
    const { correo } = req.params;
    db.query('CALL sp_obtener_usuario_por_correo(?)', [correo], (err, results) => {
        if (err) {
            console.error('❌ Error al obtener usuario:', err);
            return res.status(500).json({ error: 'Error al obtener usuario' });
        }
        if (results[0].length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.status(200).json(results[0][0]);
    });
});

// Crear un nuevo usuario
router.post('/usuarios', async (req, res) => {
    try {
        const { username, correo, contrasena, isAdmin } = req.body;
        if (!username || !correo || !contrasena) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        db.query('CALL sp_crear_usuario(?, ?, ?, ?)', [username, correo, hashedPassword, isAdmin || 0], (err, result) => {
            if (err) {
                console.error('❌ Error al registrar usuario:', err);
                return res.status(500).json({ error: 'Error al registrar usuario' });
            }
            res.status(201).json({ message: 'Usuario registrado exitosamente' });
        });
    } catch (error) {
        console.error('❌ Error en hash de contraseña:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Actualizar usuario por correo
router.put('/usuarios/:correo', (req, res) => {
    const { correo } = req.params;
    const { username, contrasena, administrador } = req.body;

    // Si viene contraseña, la tenemos que hashear antes de actualizar
    const actualizar = () => {
        db.query(
            'CALL sp_actualizar_usuario_por_correo(?, ?, ?, ?)',
            [correo, username || null, contrasenaHashed || null, administrador || null],
            (err, result) => {
                if (err) {
                    console.error('❌ Error al actualizar usuario:', err);
                    return res.status(500).json({ error: 'Error al actualizar usuario' });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Usuario no encontrado' });
                }
                res.status(200).json({ message: '✅ Usuario actualizado exitosamente' });
            }
        );
    };

    if (contrasena) {
        bcrypt.hash(contrasena, 10, (err, hash) => {
            if (err) {
                console.error('❌ Error al hashear contraseña:', err);
                return res.status(500).json({ error: 'Error en el servidor' });
            }
            contrasenaHashed = hash;
            actualizar();
        });
    } else {
        contrasenaHashed = null;
        actualizar();
    }
});

// Eliminar usuario por correo
router.delete('/usuarios/:correo', (req, res) => {
    const { correo } = req.params;
    db.query('CALL sp_eliminar_usuario_por_correo(?)', [correo], (err, result) => {
        if (err) {
            console.error('❌ Error al eliminar usuario:', err);
            return res.status(500).json({ error: 'Error al eliminar usuario' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.status(200).json({ message: '✅ Usuario eliminado exitosamente' });
    });
});

module.exports = router;
