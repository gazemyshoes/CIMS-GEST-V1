const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔁 Reasignar activo: cierra asignación anterior y crea una nueva
router.post('/asignaciones', (req, res) => {
    const { activo_id, empleado_id, area_id } = req.body;

    if (!activo_id || !empleado_id || !area_id) {
        return res.status(400).json({ error: 'activo_id, empleado_id y area_id son requeridos' });
    }

    const fechaHoy = new Date().toISOString().split("T")[0];

    const query = `CALL ReasignarActivo(?, ?, ?, ?)`;

    db.query(query, [activo_id, empleado_id, area_id, fechaHoy], (err) => {
        if (err) {
            console.error("❌ Error al reasignar activo:", err);
            return res.status(500).json({ error: "Error al reasignar activo" });
        }

        res.status(201).json({ message: "✅ Activo asignado o reasignado correctamente" });
    });
});



// 🧾 Asignar empleado a un área al momento de registrarlo (sin activo)
router.post('/asignaciones/empleado-area', (req, res) => {
  const { empleado_id, area_id } = req.body;

  if (!empleado_id || !area_id) {
    return res.status(400).json({ error: 'empleado_id y area_id son requeridos' });
  }

  const fechaHoy = new Date().toISOString().split("T")[0];
  const query = 'CALL AsignarEmpleadoArea(?, ?, ?)';

  db.query(query, [empleado_id, area_id, fechaHoy], (err) => {
    if (err) {
      console.error("❌ Error al asignar área:", err);
      return res.status(500).json({ error: 'Error al asignar el área al empleado' });
    }
    res.status(200).json({ message: "✅ Asignación procesada correctamente" });
  });
});


// ✅ NUEVA ruta para actualizar activo_id en asignación existente
router.put('/asignaciones/actualizar-activo', (req, res) => {
    const { empleado_id, activo_id } = req.body;

    if (!empleado_id || !activo_id) {
        return res.status(400).json({ error: 'empleado_id y activo_id son requeridos' });
    }

    const query = `CALL ActualizarActivoDeAsignacion(?, ?)`;

    db.query(query, [empleado_id, activo_id], (err, result) => {
        if (err) {
            console.error("❌ Error al actualizar activo_id:", err);
            return res.status(500).json({ error: 'Error al actualizar activo en la asignación' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'No se encontró una asignación válida para actualizar' });
        }

        res.status(200).json({ message: '✅ activo_id actualizado correctamente' });
    });
});



module.exports = router;
