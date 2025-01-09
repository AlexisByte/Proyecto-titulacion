const express = require('express');
const router = express.Router();
const db = require('../models');

// Get all 
router.get('/', async (req, res) => {
  try {
    const canjeaofertas = await db.tb_canjea_oferta.findAll();
    res.status(200).json(canjeaofertas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get canjeaofertas by estado CANJEADO
router.get('/estado/canjeada', async (req, res) => {
  try {
    const canjeaofertas = await db.tb_canjea_oferta.findAll({ where: { estado: 'CANJEADA' } });
    res.status(200).json(canjeaofertas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get canjeaofertas by estado GENERADO
router.get('/estado/validado', async (req, res) => {
  try {
    const canjeaofertas = await db.tb_codigos_canje.findAll({ where: { estado: 'VALIDADO' } });
    res.status(200).json(canjeaofertas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get canjeaofertas by estado VALIDADO for a specific ciudadano
router.get('/estado/validado/:ciudadanoId', async (req, res) => {
  const { ciudadanoId } = req.params;
  try {
    const canjeaofertas = await db.tb_codigos_canje.findAll({
      where: {
        estado: 'VALIDADO',
        ciudadano_id: ciudadanoId
      }
    });
    res.status(200).json(canjeaofertas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get canjeaofertas by estado EXPIRADO
router.get('/estado/generado', async (req, res) => {
  try {
    const canjeaofertas = await db.tb_codigos_canje.findAll({ where: { estado: 'GENERADO' } });
    res.status(200).json(canjeaofertas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get canjeaofertas by estado VALIDADO for a specific ciudadano
router.get('/estado/generado/:ciudadanoId', async (req, res) => {
  const { ciudadanoId } = req.params;
  try {
    const canjeaofertas = await db.tb_codigos_canje.findAll({
      where: {
        estado: 'GENERADO',
        ciudadano_id: ciudadanoId
      }
    });
    res.status(200).json(canjeaofertas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new 
router.post('/', async (req, res) => {
  try {
    const canjeaofertas = await db.tb_canjea_oferta.create(req.body);
    res.status(201).json(canjeaofertas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get an  by id
router.get('/:id', async (req, res) => {
  try {
    const canjeaofertas = await db.tb_canjea_oferta.findByPk(req.params.id);
    if (canjeaofertas) {
      res.status(200).json(canjeaofertas);
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
    const canjeaofertas = await db.tb_canjea_oferta.findByPk(req.params.id);
    if (canjeaofertas) {
      await canjeaofertas.update(req.body);
      res.status(200).json(canjeaofertas);
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
    const canjeaofertas = await db.tb_canjea_oferta.findByPk(req.params.id);
    if (canjeaofertas) {
      await canjeaofertas.destroy();
      res.status(204).json();
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
