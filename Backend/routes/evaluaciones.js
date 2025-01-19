// Importar dependencias
const express = require('express');
const router = express.Router();
const db = require('../models'); // Ajusta la ruta según tu estructura de carpetas

// Obtener todas las evaluaciones
router.get('/', async (req, res) => {
  try {
    const evaluaciones = await db.tb_evaluaciones.findAll({
      include: [
        { model: db.tb_usuarios, as: 'usuario', attributes: ['id_usuario', 'nombre', 'email'] }
      ]
    });

    res.status(200).json(evaluaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener una evaluación por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const evaluacion = await db.tb_evaluaciones.findByPk(id, {
      include: [
        { model: db.tb_usuarios, as: 'usuario', attributes: ['id_usuario', 'nombre', 'email'] }
      ]
    });

    if (!evaluacion) {
      return res.status(404).json({ message: 'Evaluación no encontrada.' });
    }

    res.status(200).json(evaluacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear una nueva evaluación
router.post('/', async (req, res) => {
  const { id_solicitante, id_usuario, fecha, resultado, detalles } = req.body;

  try {
    // Validar existencia del usuario
    const usuario = await db.tb_usuarios.findByPk(id_usuario);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const nuevaEvaluacion = await db.tb_evaluaciones.create({
      id_solicitante,
      id_usuario,
      fecha,
      resultado,
      detalles
    });

    res.status(201).json({
      message: 'Evaluación creada exitosamente.',
      data: nuevaEvaluacion
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar una evaluación por ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { id_solicitante, id_usuario, fecha, resultado, detalles } = req.body;

  try {
    const evaluacion = await db.tb_evaluaciones.findByPk(id);

    if (!evaluacion) {
      return res.status(404).json({ message: 'Evaluación no encontrada.' });
    }

    // Validar existencia del usuario si se actualiza
    if (id_usuario) {
      const usuario = await db.tb_usuarios.findByPk(id_usuario);
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }
    }

    // Actualizar la evaluación
    await evaluacion.update({
      id_solicitante,
      id_usuario,
      fecha,
      resultado,
      detalles
    });

    res.status(200).json({
      message: 'Evaluación actualizada exitosamente.',
      data: evaluacion
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar una evaluación por ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const evaluacion = await db.tb_evaluaciones.findByPk(id);

    if (!evaluacion) {
      return res.status(404).json({ message: 'Evaluación no encontrada.' });
    }

    await evaluacion.destroy();

    res.status(200).json({ message: 'Evaluación eliminada exitosamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
