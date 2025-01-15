const express = require('express');
const router = express.Router();
const db = require('../models');

// Crear una nueva regla de negocio
router.post('/', async (req, res) => {
  const { nombre_regla, descripcion, valor_parametro, id_usuario_creador } = req.body;

  try {
    // Crear una nueva regla
    const nuevaRegla = await db.tb_reglas_negocio.create({
      nombre_regla,
      descripcion,
      valor_parametro,
      id_usuario_creador,
    });

    res.status(201).json({
      message: 'Regla de negocio creada exitosamente.',
      regla: nuevaRegla,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todas las reglas de negocio
router.get('/', async (req, res) => {
  try {
    const reglas = await db.tb_reglas_negocio.findAll({
      include: [
        {
          model: db.tb_usuarios,
          as: 'creador',
          attributes: [ 'nombre'],
        },
      ],
      attributes: ['id_regla', 'nombre_regla', 'descripcion', 'valor_parametro', 'createdAt'],
    });

    res.status(200).json(reglas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener una regla de negocio por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const regla = await db.tb_reglas_negocio.findByPk(id, {
      include: [
        {
          model: db.tb_usuarios,
          as: 'creador',
          attributes: [ 'nombre'],
        },
      ],
    });

    if (!regla) {
      return res.status(404).json({ message: 'Regla de negocio no encontrada.' });
    }

    res.status(200).json(regla);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar una regla de negocio por ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre_regla, descripcion, valor_parametro ,id_usuario_creador} = req.body;

  try {
    const regla = await db.tb_reglas_negocio.findByPk(id);

    if (!regla) {
      return res.status(404).json({ message: 'Regla de negocio no encontrada.' });
    }

    await regla.update({ nombre_regla, descripcion, valor_parametro ,id_usuario_creador});

    res.status(200).json({
      message: 'Regla de negocio actualizada exitosamente.',
      regla,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar una regla de negocio por ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const regla = await db.tb_reglas_negocio.findByPk(id);

    if (!regla) {
      return res.status(404).json({ message: 'Regla de negocio no encontrada.' });
    }

    await regla.destroy();

    res.status(200).json({ message: 'Regla de negocio eliminada exitosamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
