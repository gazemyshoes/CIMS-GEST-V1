const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/areas', (req, res) => {
  const { nombre } = req.body;
  if (!nombre) {
    return res.status(400).json({ error: 'El nombre del área es obligatorio' });
  }

  const query = 'CALL CrearArea(?)';

  db.query(query, [nombre], (err, result) => {
    if (err) {
      console.error('❌ Error al crear el área:', err);
      return res.status(500).json({ error: 'Error al crear el área' });
    }
    res.status(201).json({ message: '✅ Área creada exitosamente', id: result[0].insertId });
  });
});


// Obtener todas las áreas (GET)
router.get('/areas', (req, res) => {
    const query = 'CALL ObtenerAreas()';
    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error al obtener áreas:', err);
            return res.status(500).json({ error: 'Error al obtener áreas' });
        }
        res.status(200).json(results[0]);  // results[0] porque CALL devuelve un array de arrays
    });
});

// Obtener un área por ID (GET)
router.get('/areas/:id', (req, res) => {
  const { id } = req.params;
  const query = 'CALL ObtenerAreaPorID(?)';

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener el área:', err);
      return res.status(500).json({ error: 'Error al obtener el área' });
    }
    const area = results[0];
    if (area.length === 0) {
      return res.status(404).json({ error: 'Área no encontrada' });
    }
    res.status(200).json(area[0]);
  });
});


// Actualizar un área (PUT)
router.put('/areas/:id', (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre del área es obligatorio' });
  }

  const query = 'CALL ActualizarArea(?, ?)';

  db.query(query, [id, nombre], (err, result) => {
    if (err) {
      console.error('❌ Error al actualizar el área:', err);
      return res.status(500).json({ error: 'Error al actualizar el área' });
    }
    if (result && result.affectedRows === 0)
{
      return res.status(404).json({ error: 'Área no encontrada' });
    }
    res.status(200).json({ message: '✅ Área actualizada exitosamente' });
  });
});


// // Eliminar un área (DELETE)
// router.delete('/areas/:id', (req, res) => {
//     const { id } = req.params;
//     const query = 'DELETE FROM area WHERE id = ?';
//     db.query(query, [id], (err, result) => {
//         if (err) {
//             console.error('❌ Error al eliminar el área:', err);
//             return res.status(500).json({ error: 'Error al eliminar el área' });
//         }
//         if (result.affectedRows === 0) {
//             return res.status(404).json({ error: 'Área no encontrada' });
//         }
//         res.status(200).json({ message: '✅ Área eliminada exitosamente' });
//     });
// });

module.exports = router;