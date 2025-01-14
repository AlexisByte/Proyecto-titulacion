const express = require('express');
const router = express.Router();
const db = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt'); // Asegúrate de importar bcrypt

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await db.tb_usuarios.findAll(
      {
        include: [
          {
            model: db.tb_roles,
            as: 'roles',
            attributes: ['nombre_rol'] // No incluir datos del rol en la respuesta
          },
        ],
        attributes: ['id_usuario','nombre', 'email', 'activo'] // Solo incluir estos campos
      }
    );
    // Transformar los datos para aplanar los roles
    const usuariosTransformados = usuarios.map((usuario) => {
      return {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        email: usuario.email,
        activo: usuario.activo,
        nombre_rol: usuario.roles.length > 0 ? usuario.roles[0].nombre_rol : null, // Tomar el primer rol
      };
    });

    res.status(200).json(usuariosTransformados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener usuarios por roles 
router.get('/roles/:id_rol', async (req, res) => {
  try {
    const usuarios = await db.tb_usuarios.findAll({
      include: [
        {
          model: db.tb_roles,
          as: 'roles',
          where: { id_rol: req.params.id_rol }, // Asegúrate de que aquí esté usando el tipo de dato correcto (entero)
          attributes: [], // No incluir datos del rol en la respuesta
        },
      ],
      attributes: ['id_usuario', 'nombre'], // Seleccionar solo id_usuario y nombre del usuario
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


// Crear un nuevo usuario
router.post('/', async (req, res) => {
  const { nombre, email, contrasena, rol } = req.body;

  try {
    // Verificar si el correo ya existe
    const usuarioExistente = await db.tb_usuarios.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ message: 'El correo ya está en uso.' });
    }

    // Verificar si el rol proporcionado existe
    const rolExistente = await db.tb_roles.findByPk(rol);
    if (!rolExistente) {
      return res.status(400).json({ message: 'El rol proporcionado no es válido.' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Crear el nuevo usuario
    const usuario = await db.tb_usuarios.create({
      nombre,
      email,
      contrasena: hashedPassword
    });

    // Asignar el rol al usuario
    await db.tb_usuarios_roles.create({
      id_usuario: usuario.id_usuario,
      id_rol: rol
    });

    res.status(201).json({ 
      message: 'Usuario creado exitosamente.',
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: rolExistente.nombre_rol,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Obtener un usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const usuario = await db.tb_usuarios.findByPk(req.params.id,
      {
        attributes: ['id_usuario','nombre', 'email', 'activo'] // Solo incluir estos campos
      }
    );
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
  const { id } = req.params;
  const { email, contrasena, activo, ...otrosCampos } = req.body;

  try {
    // Verificar si el usuario existe
    const usuario = await db.tb_usuarios.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Verificar si el nuevo email ya está en uso por otro usuario
    if (email && email !== usuario.email) {
      const emailExistente = await db.tb_usuarios.findOne({ where: { email } });
      if (emailExistente) {
        return res.status(400).json({ message: 'El correo ya está en uso.' });
      }
    }

    // Actualizar la contraseña si se proporciona
    let nuevaContrasena = usuario.contrasena; // Mantener la contraseña existente si no se cambia
    if (contrasena) {
      nuevaContrasena = await bcrypt.hash(contrasena, 10);
    }

    // Actualizar el estado de "activo" solo si se proporciona
    const nuevoActivo = activo !== undefined ? activo : usuario.activo;

    // Actualizar el usuario con los campos proporcionados
    await usuario.update({
      email: email || usuario.email, // Si no se envía email, usar el actual
      contrasena: nuevaContrasena,
      activo: nuevoActivo,
      ...otrosCampos, // Actualizar cualquier otro campo enviado
    });

    res.status(200).json({
      message: 'Usuario actualizado exitosamente.',
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        email: usuario.email,
        activo: usuario.activo,
      },
    });
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
      res.status(200).send({ message: 'Usuario eliminado exitosamente.' });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
/*
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
*/
module.exports = router;
