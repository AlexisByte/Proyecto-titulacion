const express = require('express');
const router = express.Router();
const db = require('../models'); // Asegúrate de que el path es correcto
const { where } = require('sequelize');

// Crear una relación usuario-rol
router.post('/', async (req, res) => {
  const { id_usuario, id_rol } = req.body;

  try {
    // Validar existencia de usuario y rol
    const usuario = await db.tb_usuarios.findByPk(id_usuario);
    const rol = await db.tb_roles.findByPk(id_rol);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    if (!rol) {
      return res.status(404).json({ message: 'Rol no encontrado.' });
    }

    // Verificar si el usuario ya tiene el mismo rol
    const usuarioRolExistente = await db.tb_usuarios_roles.findOne({
      where: { id_usuario, id_rol },
    });

    if (usuarioRolExistente) {
      return res.status(400).json({ message: 'El usuario ya tiene este rol asignado.' });
    }

    // Crear nueva relación usuario-rol
    const nuevaRelacion = await db.tb_usuarios_roles.create({ id_usuario, id_rol });

    res.status(201).json({
      message: 'Relación usuario-rol creada exitosamente.',
      data: nuevaRelacion,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Obtener todas las relaciones usuario-rol
router.get('/', async (req, res) => {
  try {
    const relaciones = await db.tb_usuarios_roles.findAll({
      include: [
        { model: db.tb_usuarios, as: 'usuario', attributes: ['id_usuario','nombre' ,'email'] },
        { model: db.tb_roles, as: 'rol', attributes: [ 'nombre_rol'] },
      ],
    });

    const resultado = relaciones.map(relacion => ({
      id_usuario_rol: relacion.id_usuario_rol,
      id_usuario: relacion.usuario.id_usuario,
      nombre: relacion.usuario.nombre,
      email: relacion.usuario.email,
      nombre_rol: relacion.rol.nombre_rol,
    }));

    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener una relación usuario-rol por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const relacion = await db.tb_usuarios_roles.findByPk(id, {
      include: [
        { model: db.tb_usuarios, as: 'usuario', attributes: ['id_usuario', 'nombre','email'] },
        { model: db.tb_roles, as: 'rol', attributes: ['nombre_rol'] },
      ],
    });

    if (!relacion) {
      return res.status(404).json({ message: 'Relación no encontrada.' });
    }

    res.status(200).json({
      id_usuario_rol: relacion.id_usuario_rol,
      id_usuario: relacion.usuario.id_usuario,
      nombre: relacion.usuario.nombre,
      email: relacion.usuario.email,
      nombre_rol: relacion.rol.nombre_rol,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar una relación usuario-rol
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { id_usuario, id_rol } = req.body;

  try {
    const relacion = await db.tb_usuarios_roles.findByPk(id);

    if (!relacion) {
      return res.status(404).json({ message: 'Relación no encontrada.' });
    }

    // Validar existencia de usuario si se proporciona
    if (id_usuario) {
      const usuario = await db.tb_usuarios.findByPk(id_usuario);
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }
    }

    // Validar existencia de rol si se proporciona
    if (id_rol) {
      const rol = await db.tb_roles.findByPk(id_rol);
      if (!rol) {
        return res.status(404).json({ message: 'Rol no encontrado.' });
      }
    }
    const user = relacion.id_usuario;
    console.log('usuario', user)
    // Verificar si la combinación id_usuario + id_rol ya existe y no es la relación actual
    if (id && id_rol) {
      const relacionExistente = await db.tb_usuarios_roles.findOne({
        where: { id_usuario:user,id_rol },
      });

      if (relacionExistente && relacionExistente.id_usuario_rol !== relacion.id_usuario_rol) {
        return res.status(400).json({
          message: 'La combinación de usuario y rol ya existe.',
        });
      }
    }

    // Actualizar la relación
    await relacion.update({
      id_usuario: id_usuario || relacion.id_usuario,
      id_rol: id_rol || relacion.id_rol,
    });

    res.status(200).json({
      message: 'Relación usuario-rol actualizada exitosamente.',
      data: relacion,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Eliminar una relación usuario-rol
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const relacion = await db.tb_usuarios_roles.findByPk(id);

    if (!relacion) {
      return res.status(404).json({ message: 'Relación no encontrada.' });
    }

    await relacion.destroy();

    res.status(200).json({ message: 'Relación usuario-rol eliminada exitosamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
