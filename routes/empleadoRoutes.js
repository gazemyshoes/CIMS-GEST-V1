const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// ✅ Obtener todos los empleados
router.get('/empleados', (req, res) => {
    db.query('CALL sp_obtener_empleados()', (err, results) => {
        if (err) {
            console.error('❌ Error:', err);
            return res.status(500).json({ error: 'Error al obtener empleados' });
        }
        res.status(200).json(results[0]);
    });
});

// Obtener un empleado por ID
router.get('/empleados/:id', (req, res) => {
    const { id } = req.params;

    db.query('CALL sp_obtener_empleado_por_id(?)', [id], (err, results) => {
        if (err) {
            console.error('❌ Error al obtener empleado:', err);
            return res.status(500).json({ error: 'Error al obtener empleado' });
        }

        if (results[0].length === 0) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }

        res.status(200).json(results[0][0]);
    });
});

// Crear un empleado y registrar en activo_empleado_area (sin activo_id)
router.post('/empleados', requireAdmin, (req, res) => {
    const { nombre, correo, fecha_ingreso, area_id, codigo } = req.body;

    if (!nombre || !area_id || !codigo) {
        return res.status(400).json({ error: 'El nombre, código y área_id son obligatorios' });
    }

    const query = `CALL CrearEmpleadoConArea(?, ?, ?, ?, ?)`;

    const values = [
        codigo.toUpperCase(),
        nombre.toUpperCase(),
        correo || null,
        fecha_ingreso || new Date().toISOString().split('T')[0],
        area_id
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('❌ Error al registrar empleado:', err);
            return res.status(500).json({ error: 'Error al registrar el empleado' });
        }

        const empleado_id = result[0][0].empleado_id;
        res.status(201).json({
            message: '✅ Empleado y asignación registrados correctamente.',
            empleado_id
        });
    });
});


// Ruta para actualizar empleado (SIN TOCAR EL ÁREA)
router.put('/empleados/:id', (req, res) => {
    const { id } = req.params;
    
    // 1. Recibimos solo los datos que vamos a cambiar
    const { nombre, correo, fecha_ingreso } = req.body;

    // 2. Consulta SQL LIMPIA: Eliminamos cualquier referencia a 'area_id' o 'area'
    // Así la base de datos mantiene el área que ya tenía el empleado.
    const query = `
        UPDATE empleado 
        SET nombre = ?, 
            correo = ?, 
            fecha_ingreso = ? 
        WHERE id = ?
    `;

    db.query(query, [nombre, correo, fecha_ingreso, id], (err, result) => {
        if (err) {
            console.error("❌ Error al actualizar empleado:", err);
            return res.status(500).json({ error: "Error interno del servidor al actualizar" });
        }
        
        res.json({ message: "✅ Empleado actualizado correctamente" });
    });
});

// Eliminar un empleado (DELETE)
/*
router.delete('/empleados/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM empleado WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('❌ Error al eliminar el empleado:', err);
            return res.status(500).json({ error: 'Error al eliminar el empleado' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }
        res.status(200).json({ message: '✅ Empleado eliminado exitosamente' });
    });
});
*/

module.exports = router;
