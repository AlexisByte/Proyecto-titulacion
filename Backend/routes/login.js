const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models'); // Ajusta según tu estructura de proyecto
const router = express.Router();

// Clave secreta para firmar los tokens
const SECRET_KEY = 't_clv_scrt_sgr'; // Cambia esto por una clave más segura

// Ruta de login
router.post('/', async (req, res) => {
  const { email, contrasena } = req.body;

  try {
    // Buscar usuario por email
    const usuario = await db.tb_usuarios.findOne({ where: { email } });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Verificar contraseña
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!contrasenaValida) {
      return res.status(401).json({ message: 'Contraseña incorrecta.' });
    }

    // Generar token
    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, email: usuario.email },
      SECRET_KEY,
      { expiresIn: '8h' } // Token válido por 8 horas
    );

    res.status(200).json({ 
      message: 'Inicio de sesión exitoso.',
      token 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
