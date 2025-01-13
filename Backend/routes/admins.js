const express = require('express');
const router = express.Router();
const db = require('../models');
const { Op } = require('sequelize');

// Obtener usuarios con rol igual a 1
router.get('/', async (req, res) => {
  try {
    // Obtener los usuarios con rol ID = 1
    const usuarios = await db.tb_usuarios.findAll({
      include: [
        {
          model: db.tb_roles, // Relación con roles
          as: 'rol', // Alias definido en la asociación Sequelize
          where: { id: 1 }, // Filtrar por rol ID = 1
          attributes: [], // No incluir datos del rol en la respuesta
        },
      ],
      attributes: ['id', 'nombre'], // Seleccionar solo id y nombre del usuario
    });

    // Verificar si hay usuarios
    if (!usuarios || usuarios.length === 0) {
      return res.status(404).json({ message: 'No se encontraron usuarios con el rol especificado.' });
    }

    // Responder con los usuarios
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
