const express = require('express');
const router = express.Router();
const db = require('../models');

// Get all 
router.get('/', async (req, res) => {
  try {
    const greecoins = await db.tb_greencoin_cdn.findAll();
    res.status(200).json(greecoins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new 
router.post('/', async (req, res) => {
  try {
    const greecoins = await db.tb_greencoin_cdn.create(req.body);
    res.status(201).json(greecoins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get an  by id
router.get('/:id', async (req, res) => {
  try {
    const greecoins = await db.tb_greencoin_cdn.findByPk(req.params.id);
    if (greecoins) {
      res.status(200).json(greecoins);
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
    const greecoins = await db.tb_greencoin_cdn.findByPk(req.params.id);
    if (greecoins) {
      await greecoins.update(req.body);
      res.status(200).json(greecoins);
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
    const greecoins = await db.tb_greencoin_cdn.findByPk(req.params.id);
    if (greecoins) {
      await greecoins.destroy();
      res.status(204).json();
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
