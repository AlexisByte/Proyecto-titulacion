const db = require('../models');

async function verificarAdmin(req, res, next) {
  try {
    const id_usuario = req.usuario.id_usuario;

    // Obtener roles del usuario
    const roles = await db.tb_usuarios_roles.findAll({
      where: { id_usuario },
      attributes: ['id_rol']
    });

    const rolesIds = roles.map(r => r.id_rol);

    // Verificar si tiene rol administrador (ej: id_rol = 1)
    if (!rolesIds.includes(1)) {
      return res.status(403).json({ message: 'Acceso denegado: solo administradores.' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = verificarAdmin;
