const express = require('express');
const router = express.Router();
const db = require('../models');

// Get all 
router.get('/', async (req, res) => {
  try {
    const materiales = await db.tb_materiales.findAll();
    res.status(200).json(materiales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get materiales con estado = true (activos)
router.get('/activo', async (req, res) => {
  try {
    const materiales = await db.tb_materiales.findAll({ where: { estado: true } });
    res.status(200).json(materiales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new 
router.post('/', async (req, res) => {
  try {
    const materiales = await db.tb_materiales.create(req.body);
    res.status(201).json(materiales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get an  by id
router.get('/:id', async (req, res) => {
  try {
    const materiales = await db.tb_materiales.findByPk(req.params.id);
    if (materiales) {
      res.status(200).json(materiales);
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
    const materiales = await db.tb_materiales.findByPk(req.params.id);
    if (materiales) {
      await materiales.update(req.body);
      res.status(200).json(materiales);
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
    const materiales = await db.tb_materiales.findByPk(req.params.id);
    if (materiales) {
      await materiales.destroy();
      res.status(204).json();
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
