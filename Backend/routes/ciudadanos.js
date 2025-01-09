const express = require('express');
const router = express.Router();
const db = require('../models');

// Get all 
router.get('/', async (req, res) => {
  try {
    const ciudadanos = await db.tb_ciudadano.findAll();
    res.status(200).json(ciudadanos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/active', async (req, res) => {
  try {
    const ciudadanos = await db.tb_ciudadano.findAll({ where: { estado: true } });
    res.status(200).json(ciudadanos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/inactive', async (req, res) => {
  try {
    const ciudadanos = await db.tb_ciudadano.findAll({ where: { estado: false } });
    res.status(200).json(ciudadanos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Create a new 
router.post('/', async (req, res) => {
  try {
    const ciudadanos = await db.tb_ciudadano.create(req.body);
    res.status(201).json(ciudadanos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get an  by id
router.get('/:id', async (req, res) => {
  try {
    const ciudadanos = await db.tb_ciudadano.findByPk(req.params.id);
    if (ciudadanos) {
      const credencial = await db.tb_credenciales.findOne({ 
        where: { usuario_id: ciudadanos.ciudadano_id } });
      const gc = await db.tb_greencoin_cdn.findOne({
        where: { greencoin_id: ciudadanos.greencoin_id }
      });
      res.status(200).json({
        ciudadano_id: ciudadanos.ciudadano_id,
        correo_electronico: credencial.correo_electronico,
        tipousuario: credencial.tipousuario,
        nombre: ciudadanos.nombre,
        apellido: ciudadanos.apellido,
        telefono: ciudadanos.telefono,
        fecha_nac: ciudadanos.fecha_nac,
        estado: ciudadanos.estado,
        greencoins: gc.total
        }
    ); 

    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

  /*
  userInfo = await tb_ciudadano.findOne({ where: { ciudadano_id: credencial.usuario_id } });

            const gc = await tb_greencoin_cdn.findOne({
                where: { greencoin_id: userInfo.greencoin_id }
            });

            res.json({ token ,
                user: {
                    ciudadano_id: credencial.usuario_id,
                    correo_electronico: credencial.correo_electronico,
                    tipousuario: credencial.tipousuario,
                    nombre: userInfo.nombre,
                    apellido: userInfo.apellido,
                    telefono: userInfo.telefono,
                    fecha_nac: userInfo.fecha_nac,
                    estado: userInfo.estado,
                    greencoins: gc.total
                }
            });
  */


});

// Update an  by id
router.put('/:id', async (req, res) => {
  try {
    const ciudadanos = await db.tb_ciudadano.findByPk(req.params.id);
    if (ciudadanos) {
      await ciudadanos.update(req.body);
      res.status(200).json(ciudadanos);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an  by id
router.delete('/:id', async (req, res) => {
  try {
    const ciudadanos = await db.tb_ciudadano.findByPk(req.params.id);
    if (ciudadanos) {
      await ciudadanos.destroy();
      res.status(204).json();
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
