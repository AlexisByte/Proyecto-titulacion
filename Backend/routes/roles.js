const express = require('express');
const router = express.Router();
const db = require('../models');

// Registro de actividad
const logActivity = async (action, details, userId) => {
  try {
    await db.tb_actividad.create({
      accion: action,
      detalles: details,
      id_usuario: userId,
      fecha: new Date()
    });
  } catch (error) {
    console.error('Error al registrar actividad:', error);
  }
};

// Obtener todos los roles
router.get('/', async (req, res) => {
  try {
    const roles = await db.tb_roles.findAll({
      attributes: ['id_rol', 'nombre_rol', 'descripcion'], // Seleccionar solo estos campos
    });

    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un rol por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const rol = await db.tb_roles.findByPk(id, {
      attributes: ['id_rol', 'nombre_rol', 'descripcion'],
    });

    if (!rol) {
      return res.status(404).json({ message: 'Rol no encontrado.' });
    }

    res.status(200).json(rol);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear un nuevo rol
router.post('/', async (req, res) => {
  const { nombre_rol, descripcion } = req.body;

  try {
    // Validar que no exista un rol con el mismo nombre
    const rolExistente = await db.tb_roles.findOne({ where: { nombre_rol } });
    if (rolExistente) {
      return res.status(400).json({ message: 'El rol ya existe.' });
    }

    const nuevoRol = await db.tb_roles.create({
      nombre_rol,
      descripcion,
    });

    await logActivity('Rol creado', `Rol ${nombre_rol} creado`, req.usuario.id_usuario);

    res.status(201).json({
      message: 'Rol creado exitosamente.',
      rol: nuevoRol,
    });
  } catch (error) {
    await logActivity('Error creando rol', error.message, req.usuario.id_usuario);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un rol
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre_rol, descripcion } = req.body;

  try {
    const rol = await db.tb_roles.findByPk(id);
    if (!rol) {
      return res.status(404).json({ message: 'Rol no encontrado.' });
    }

    // Validar que no exista un rol con el mismo nombre (excepto el actual)
    if (nombre_rol && nombre_rol !== rol.nombre_rol) {
      const rolExistente = await db.tb_roles.findOne({ where: { nombre_rol } });
      if (rolExistente) {
        return res.status(400).json({ message: 'El rol ya existe.' });
      }
    }

    await rol.update({ nombre_rol, descripcion });

    await logActivity('Rol modificado', `Rol ${nombre_rol} modificado`, req.usuario.id_usuario);


    res.status(200).json({
      message: 'Rol actualizado exitosamente.',
      rol,
    });
  } catch (error) {
    await logActivity('Error modificando rol', error.message, req.usuario.id_usuario);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un rol
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const rol = await db.tb_roles.findByPk(id);
    if (!rol) {
      return res.status(404).json({ message: 'Rol no encontrado.' });
    }

    await rol.destroy();
    await logActivity('Rol eliminado', `Rol ${rol.nombre_rol} eliminado`, req.usuario.id_usuario);

    res.status(200).json({ message: 'Rol eliminado exitosamente.' });
  } catch (error) {
        await logActivity('Error eliminando rol', error.message, req.usuario.id_usuario);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
