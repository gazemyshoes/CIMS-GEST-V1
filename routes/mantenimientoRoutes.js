const express = require('express');
const router = express.Router();
const db = require('../db');

// Iniciar mantenimiento
router.post('/mantenimientos/iniciar', (req, res) => {
    const { incidencia_id, init_mantenimiento } = req.body;

    if (!incidencia_id || !init_mantenimiento) {
        return res.status(400).json({ error: 'Faltan datos obligatorios para iniciar mantenimiento' });
    }

    db.query('CALL sp_iniciar_mantenimiento(?, ?)', [incidencia_id, init_mantenimiento], (err, results) => {
        if (err) {
            console.error("❌ Error:", err);
            return res.status(500).json({ error: err.sqlMessage || 'Error al iniciar mantenimiento' });
        }
        res.status(201).json({ message: "✅ Mantenimiento iniciado" });
    });
});

// Finalizar mantenimiento

router.post('/mantenimientos/finalizar', (req, res) => {
    const { incidencia_id, fin_mantenimiento } = req.body;

    if (!incidencia_id || !fin_mantenimiento) {
        return res.status(400).json({ error: 'Faltan datos obligatorios para finalizar mantenimiento' });
    }

    db.query('CALL sp_finalizar_mantenimiento(?, ?)', [incidencia_id, fin_mantenimiento], (err, results) => {
        if (err) {
            console.error("❌ Error:", err);
            return res.status(500).json({ error: err.sqlMessage || 'Error al finalizar mantenimiento' });
        }
        res.status(200).json({ message: "✅ Mantenimiento finalizado" });
    });
});

// Obtener historial de mantenimiento
router.get('/mantenimientos/historial', (req, res) => {
    db.query('CALL sp_historial_mantenimiento()', (err, results) => {
        if (err) {
            console.error("❌ Error:", err);
            return res.status(500).json({ error: 'Error al obtener el historial' });
        }
        res.status(200).json(results[0]);
    });
});

module.exports = router;
