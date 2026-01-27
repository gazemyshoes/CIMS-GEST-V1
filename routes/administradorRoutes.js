const express = require('express');
const router = express.Router();
const db = require('../db');



// Crear un administrador (POST)
router.post('/administradores', (req, res) => {
    const { nombre, correo, contrasena } = req.body;

    // Validación básica
    if (!nombre || !correo || !contrasena) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios (nombre, correo, contrasena)' });
    }

    const query = `
        INSERT INTO administrador (nombre, correo, contrasena, fecha_creacion) 
        VALUES (?, ?, ?, DEFAULT)
    `;
    db.query(query, [nombre, correo, contrasena], (err, result) => {
        if (err) {
            console.error('Error al insertar administrador:', err.sqlMessage || err);
            return res.status(500).json({ error: 'Error al crear el administrador' });
        }
        res.status(201).json({ message: 'Administrador creado exitosamente', id: result.insertId });
    });
});
// Obtener todos los administradores por id (GET)
// Obtener un administrador por ID
router.get('/administradores/:id', (req, res) => {
    const { id } = req.params; // Obtén el ID de los parámetros de la URL
    const query = 'SELECT * FROM administrador WHERE id = ?';

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener el administrador:', err.sqlMessage || err);
            return res.status(500).json({ error: 'Error al obtener el administrador' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Administrador no encontrado' });
        }

        res.status(200).json(results[0]); // Envía el administrador encontrado
    });
});
// Obtener todos los administradores (GET)
router.get('/administradores', (req, res) => {
    const query = 'SELECT * FROM administrador'; // Consulta para obtener todos los registros

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los administradores:', err.sqlMessage || err);
            return res.status(500).json({ error: 'Error al obtener los administradores' });
        }

        res.status(200).json(results); // Devuelve todos los registros como un arreglo
    });
});


// Actualizar un administrador (PUT)
router.put('/administradores/:id', (req, res) => {
    const { id } = req.params; // ID del administrador a actualizar
    const { nombre, correo, contrasena } = req.body;

    const query = `
        UPDATE administrador 
        SET nombre = ?, correo = ?, contrasena = ? 
        WHERE id = ?
    `;

    db.query(query, [nombre, correo, contrasena, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar el administrador:', err.sqlMessage || err);
            return res.status(500).json({ error: 'Error al actualizar el administrador' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Administrador no encontrado' });
        }
        res.status(200).json({ message: 'Administrador actualizado exitosamente' });
    });
});
// Eliminar un administrador (DELETE)
router.delete('/administradores/:id', (req, res) => {
    const { id } = req.params; // ID del administrador a eliminar

    const query = `DELETE FROM administrador WHERE id = ?`;

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el administrador:', err.sqlMessage || err);
            return res.status(500).json({ error: 'Error al eliminar el administrador' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Administrador no encontrado' });
        }
        res.status(200).json({ message: 'Administrador eliminado exitosamente' });
    });
});



module.exports = router;