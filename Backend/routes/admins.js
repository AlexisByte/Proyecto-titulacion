const express = require('express');
const router = express.Router();
const db = require('../models');
const { Op } = require('sequelize');

// Get all 
router.get('/', async (req, res) => {
  try {
    const admin = await db.tb_admin.findAll({
      where: {
        admin_id: {
          [Op.gt]: 1  // Utiliza el operador 'greater than' (mayor que)
        }
      }
    });
    //const admin = await db.tb_admin.findAll();
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new 
router.post('/', async (req, res) => {
  try {
    const admin = await db.tb_admin.create(req.body);
    res.status(201).json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get an  by id
router.get('/:id', async (req, res) => {
  try {
    const admin = await db.tb_admin.findByPk(req.params.id);
    if (admin) {
      res.status(200).json(admin);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an  by id
router.put('/:id', async (req, res) => {
  try {
    const admin = await db.tb_admin.findByPk(req.params.id);
    if (admin) {
      await admin.update(req.body);
      res.status(200).json(admin);
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
    const admins = await db.tb_admin.findAll();
    const admin = await db.tb_admin.findByPk(req.params.id);
    if (admin && admins) {
      await admin.destroy();
      console.log(admins)
      res.status(204).json(admins);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/delete/:idcredencial/:idadmin', async (req, res) => {
  const { idcredencial, idadmin } = req.params;
  
  try {
    const credencial = await db.tb_credenciales.findByPk(idcredencial);
    const admin = await db.tb_admin.findByPk(idadmin);
    const credenciales = await db.tb_credenciales.findAll();

    if (credencial && admin) {
      await Promise.all([
        credencial.destroy(),
        admin.destroy()
      ]);
      res.status(204).json(credenciales);
    } else {
      res.status(404).json({ message: 'Credencial or Admin not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
