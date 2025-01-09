const express = require('express');
const router = express.Router();
const db = require('../models');
const { Op } = require('sequelize');

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await db.tb_usuarios.findAll();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear un nuevo usuario
router.post('/', async (req, res) => {
    const { nombre, email, contrasena } = req.body;
  
    try {
      // Verificar si el correo ya existe
      const usuarioExistente = await db.tb_usuarios.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).json({ message: 'El correo ya está en uso.' });
      }
  
      // Encriptar la contraseña
      const hashedPassword = await bcrypt.hash(contrasena, 10);
  
      // Crear el nuevo usuario
      const usuario = await db.tb_usuarios.create({
        nombre,
        email,
        contrasena: hashedPassword
      });
  
      res.status(201).json(usuario);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Obtener un usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const usuario = await db.tb_usuarios.findByPk(req.params.id);
    if (usuario) {
      res.status(200).json(usuario);
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un usuario por ID
router.put('/:id', async (req, res) => {
  try {
    const usuario = await db.tb_usuarios.findByPk(req.params.id);
    if (usuario) {
      await usuario.update(req.body);
      res.status(200).json(usuario);
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un usuario por ID
router.delete('/:id', async (req, res) => {
  try {
    const usuario = await db.tb_usuarios.findByPk(req.params.id);
    if (usuario) {
      await usuario.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar múltiples usuarios por IDs
router.delete('/delete', async (req, res) => {
  const { ids } = req.body; // Espera un array de IDs
  try {
    const usuarios = await db.tb_usuarios.findAll({
      where: {
        id_usuario: {
          [Op.in]: ids
        }
      }
    });

    if (usuarios.length > 0) {
      await Promise.all(usuarios.map(usuario => usuario.destroy()));
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Usuarios no encontrados' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
