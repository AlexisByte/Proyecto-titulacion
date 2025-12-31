const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models');
const router = express.Router();

// Registro de actividad
const logActivity = async (action, details, userId) => {
  try {
    await db.tb_actividad.create({
      accion: action,
      detalles: details,
      id_usuario: userId
    });
  } catch (error) {
    console.error('Error al registrar actividad:', error);
  }
};

const SECRET_KEY = 't_clv_scrt_sgr';

router.post('/', async (req, res) => {
  const { email, contrasena } = req.body;

  try {
    const usuario = await db.tb_usuarios.findOne({ where: { email } });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!contrasenaValida) {
      await logActivity('Login fallido', 'Contraseña incorrecta', usuario.id_usuario);
      return res.status(401).json({ message: 'Contraseña incorrecta.' });
    }

    // Generar token
    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, email: usuario.email },
      SECRET_KEY,
      { expiresIn: '8h' }
    );

    const rol = await db.tb_usuarios_roles.findAll({ where: { id_usuario: usuario.id_usuario } });
    const id_roles = rol.map(r => r.id_rol);
    
    // Registrar login exitoso
    await logActivity('Login exitoso', 'Inicio de sesión correcto', usuario.id_usuario);

    res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        activo: usuario.activo,
      },
      roles: id_roles,
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
