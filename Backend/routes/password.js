const express = require('express');
const crypto = require('crypto');
const db = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { sendResetEmail } = require('../utils/email');
const router = express.Router();

const passwordResetTokens = new Map(); // Almacena los tokens en memoria

// Ruta para solicitar un código de recuperación
router.post('/recuperar-clave', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'El correo electrónico es obligatorio.' });
  }

  const user = await db.tb_usuarios.findOne({ where: { email } });

  if (!user) {
    return res.status(200).json({ message: 'Si el correo es válido, se enviará un código de recuperación.' });
  }

  const token = crypto.randomInt(100000, 999999).toString(); // Código de 6 dígitos
  passwordResetTokens.set(email, { token, expires: Date.now() + 600000 });

  setTimeout(() => passwordResetTokens.delete(email), 600000); // Eliminar token después de 10 min

  await sendResetEmail(email, token);

  res.status(200).json({ message: 'Si el correo es válido, se enviará un código de recuperación.' });
});

  
// Ruta para cambiar la contraseña con la contraseña actual
router.post('/cambiar-clave', async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    const user = await db.tb_usuarios.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.contrasena);

    if (!isMatch) {
      return res.status(400).json({ error: 'Contraseña actual incorrecta.' });
    }

    user.contrasena = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Contraseña actualizada con éxito.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cambiar la contraseña.' });
  }
});
  
// Ruta para restablecer la contraseña con código de recuperación
router.post('/restablecer-clave', async (req, res) => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  const storedTokenData = passwordResetTokens.get(email);

  if (!storedTokenData || storedTokenData.token !== token || storedTokenData.expires < Date.now()) {
    return res.status(400).json({ error: 'El código es inválido o ha expirado.' });
  }

  try {
    const user = await db.tb_usuarios.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    passwordResetTokens.delete(email); // Eliminar el token antes de cambiar la contraseña

    user.contrasena = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Contraseña actualizada con éxito.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cambiar la contraseña.' });
  }
});

  module.exports = router;
