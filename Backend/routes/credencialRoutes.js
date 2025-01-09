const express = require('express');
const router = express.Router();
const db = require('../models');

// Get all credenciales
router.get('/', async (req, res) => {
  try {
    const credenciales = await db.tb_credenciales.findAll();
    res.status(200).json(credenciales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new credencial
router.post('/', async (req, res) => {
  try {
    const credencial = await db.tb_credenciales.create(req.body);
    res.status(201).json(credencial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a credencial by id
router.get('/:id', async (req, res) => {
  try {
    const credencial = await db.tb_credenciales.findByPk(req.params.id);
    if (credencial) {
      res.status(200).json(credencial);
    } else {
      res.status(404).json({ message: 'Credencial not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// get a credencial by id user y type user
router.get('/:usuario_id/:tipousuario', async (req, res) => {
  try {
    const { usuario_id, tipousuario } = req.params;
    console.log(`Received params - usuario_id: ${usuario_id}, tipousuario: ${tipousuario}`);
    
    const credencial = await db.tb_credenciales.findOne({ where: { usuario_id, tipousuario } });
    console.log(`Found credencial: ${JSON.stringify(credencial)}`);
    
    if (credencial) {
      res.status(200).json(credencial);
    } else {
      res.status(404).json({ message: 'Credencial not found' });
    }
  } catch (error) {
    console.error(`Error finding credencial: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Update a credencial by id
router.put('/:id', async (req, res) => {
  try {
    const credencial = await db.tb_credenciales.findByPk(req.params.id);
    if (credencial) {
      await credencial.update(req.body);
      res.status(200).json(credencial);
    } else {
      res.status(404).json({ message: 'Credencial not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a credencial by id
router.delete('/:id', async (req, res) => {
  try {
    const credenciales = await db.tb_credenciales.findAll();
    const credencial = await db.tb_credenciales.findByPk(req.params.id);
    if (credencial) {
      await credencial.destroy();
      res.status(204).json(credenciales);
    } else {
      res.status(404).json({ message: 'Credencial not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
