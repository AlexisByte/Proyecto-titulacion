const express = require('express');
const router = express.Router();
const db = require('../models');
const verificarAdmin = require('../controllers/verificarAdmin'); // el middleware que creamos

router.get('/', verificarAdmin, async (req, res) => {
  try {
    const actividades = await db.tb_actividad.findAll({
      include: [{
        model: db.tb_usuarios,
        as: 'usuario',
        attributes: ['id_usuario', 'nombre', 'email']
      }],
      order: [['fecha', 'DESC']]
    });

    res.status(200).json(actividades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
