const express = require('express');
const router = express.Router();
const db = require('../models'); // Asegúrate de que la ruta sea correcta

// Obtener todos los reportes
router.get('/', async (req, res) => {
  try {
    const reportes = await db.tb_reportes.findAll({
      include: [
        { model: db.tb_usuarios, as: 'usuario', attributes: ['id_usuario', 'nombre', 'email'] },
      ],
    });

    res.status(200).json(reportes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un reporte por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const reporte = await db.tb_reportes.findByPk(id, {
      include: [
        { model: db.tb_usuarios, as: 'usuario', attributes: ['id_usuario', 'nombre', 'email'] },
      ],
    });

    if (!reporte) {
      return res.status(404).json({ message: 'Reporte no encontrado.' });
    }

    res.status(200).json(reporte);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear un nuevo reporte
router.post('/', async (req, res) => {
  const { id_usuario, contenido } = req.body;

  try {
    // Validar existencia del usuario
    const usuario = await db.tb_usuarios.findByPk(id_usuario);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Crear el reporte
    const nuevoReporte = await db.tb_reportes.create({ id_usuario, tipo_reporte, contenido });

    res.status(201).json({
      message: 'Reporte creado exitosamente.',
      data: nuevoReporte,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un reporte por ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { id_usuario, contenido } = req.body;

  try {
    const reporte = await db.tb_reportes.findByPk(id);

    if (!reporte) {
      return res.status(404).json({ message: 'Reporte no encontrado.' });
    }

    // Validar existencia del usuario si se actualiza
    if (id_usuario) {
      const usuario = await db.tb_usuarios.findByPk(id_usuario);
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }
    }

    // Actualizar el reporte
    await reporte.update({ id_usuario, tipo_reporte, contenido });

    res.status(200).json({
      message: 'Reporte actualizado exitosamente.',
      data: reporte,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un reporte por ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const reporte = await db.tb_reportes.findByPk(id);

    if (!reporte) {
      return res.status(404).json({ message: 'Reporte no encontrado.' });
    }

    await reporte.destroy();

    res.status(200).json({ message: 'Reporte eliminado exitosamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
