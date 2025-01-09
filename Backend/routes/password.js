const express = require('express');
const crypto = require('crypto');
const db = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { sendResetEmail } = require('../utils/email');
const router = express.Router();

router.post('/recuperar-password', async (req, res) => {
  const { email } = req.body;
  console.log("VERIFICAR "+ email)
  const user = await db.tb_credenciales.findOne({ where: { correo_electronico : email } });

  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const token = crypto.randomBytes(3).toString('hex'); // Código de 6 caracteres
  user.resetToken = token;
  user.resetTokenExpires = Date.now() + 3600000; // Código válido por 1 hora
  await user.save();

  //const resetLink = `http://localhost:4200/reset-password?token=${token}&email=${email}`;
  await sendResetEmail(email, token);

  res.status(200).json({ message: 'Código de recuperación enviado' });
});

//module.exports = router;

router.post('/validate-token', async (req, res) => {
    console.log("AQUI");
    const { token, correo_electronico } = req.body;
    if (!token || !correo_electronico) {
        return res.status(400).json({ error: 'El campo token y correo_electronico son obligatorios' });
      }
    const user = await db.tb_credenciales.findOne({
      where: {
        correo_electronico,
        resetToken: token,
        resetTokenExpires: {
          [Op.gt]: Date.now()
        }
      }
    });
  
    if (!user) {
      return res.status(400).json({ error: 'Código inválido o expirado' });
    }
  
    res.status(200).json({ message: 'Código válido' });
  });
  
  router.post('/reset-password', async (req, res) => {
    const { password, token, correo_electronico } = req.body;
    const user = await db.tb_credenciales.findOne({
      where: {
        correo_electronico,
        resetToken: token,
        resetTokenExpires: {
          [Op.gt]: Date.now()
        }
      }
    });
  
    if (!user) {
      return res.status(400).json({ error: 'Código inválido o expirado' });
    }
  
    //const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
  
    user.contrasena  = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();
  
    res.status(200).json({ message: 'Contraseña restablecida' });
  });
  
  router.post('/cambiar-password', async (req, res) => {
    const { correo_electronico, currentPassword, newPassword } = req.body;
  
    // Verificar que se han proporcionado todos los campos necesarios
    if (!correo_electronico || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
  
    try {
      // Buscar el usuario en la base de datos
      const user = await db.tb_credenciales.findOne({ where: { correo_electronico } });
  
      // Verificar si el usuario existe
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      // Comparar la contraseña actual proporcionada con la almacenada en la base de datos
      const isMatch = await bcrypt.compare(currentPassword, user.contrasena);
  
      // Si las contraseñas no coinciden, devolver un error
      if (!isMatch) {
        return res.status(400).json({ error: 'Contraseña actual incorrecta' });
      }
  
      // Hashear la nueva contraseña antes de guardarla
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Actualizar la contraseña en la base de datos
      user.contrasena = hashedPassword;
      await user.save();
  
      // Devolver una respuesta de éxito
      res.status(200).json({ message: 'Contraseña actualizada con éxito' });
    } catch (error) {
      // Manejar cualquier error que ocurra durante el proceso
      console.error(error);
      res.status(500).json({ error: 'Error al cambiar la contraseña' });
    }
  });
  
  module.exports = router;
/*
router.post('/reset-password', async (req, res) => {
    const { password, token, email } = req.body;
    const user = await db.tb_credenciales.findOne({
      where: {
        correo_electronico : email,
        resetToken: token,
        resetTokenExpires: {
          [Op.gt]: Date.now()
        }
      }
    });
  
    if (!user) {
      return res.status(400).json({ error: 'Código inválido o expirado' });
    }
  
    // Hashea la nueva contraseña antes de guardarla
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
  
    user.correo_electronico = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();
  
    res.status(200).json({ message: 'Contraseña restablecida' });
  });
  
  module.exports = router;*/