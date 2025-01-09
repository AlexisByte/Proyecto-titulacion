const express = require('express');
const router = express.Router();
const db = require('../models');

// Get all 
router.get('/', async (req, res) => {
  try {
    const reciclajes = await db.tb_reciclaje.findAll();
    res.status(200).json(reciclajes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new 
router.post('/', async (req, res) => {
  try {
    const reciclajes = await db.tb_reciclaje.create(req.body);
    res.status(201).json(reciclajes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get an  by id
router.get('/:id', async (req, res) => {
  try {
    const reciclajes = await db.tb_reciclaje.findByPk(req.params.id);
    if (reciclajes) {
      res.status(200).json(reciclajes);
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
    const reciclajes = await db.tb_reciclaje.findByPk(req.params.id);
    if (reciclajes) {
      await reciclajes.update(req.body);
      res.status(200).json(reciclajes);
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
    const reciclajes = await db.tb_reciclaje.findByPk(req.params.id);
    if (reciclajes) {
      await reciclajes.destroy();
      res.status(204).json();
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
