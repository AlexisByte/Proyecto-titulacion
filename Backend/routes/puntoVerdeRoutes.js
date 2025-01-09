const express = require('express');
const axios = require('axios');
const router = express.Router();
const db = require('../models');
const geoLocationController = require('../controllers/geoLocationController');
// Get all 
router.get('/', async (req, res) => {
  try {
    const puntosverdes = await db.tb_puntos_verdes.findAll();
    res.status(200).json(puntosverdes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/activos', async (req, res) => {
  try {
    // Supongamos que el campo de estado se llama 'activo' y que es un booleano.
    const puntosverdesActivos = await db.tb_puntos_verdes.findAll({
      where: {
        estado: true
      }
    });
    res.status(200).json(puntosverdesActivos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/inactivos', async (req, res) => {
  try {
    // Supongamos que el campo de estado se llama 'activo' y que es un booleano.
    const puntosverdesActivos = await db.tb_puntos_verdes.findAll({
      where: {
        estado: false
      }
    });
    res.status(200).json(puntosverdesActivos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Obtener una direccion a partir de latitud y longitud
router.get('/geocode', async (req, res) => {
  const { lat, lng } = req.query;
  const apiKey = 'AIzaSyBR6xZnxe2B4Kw9VvuKGLNk9RDN_X7O2DU'; // Reemplaza con tu clave de API real
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new 
/*
router.post('/', async (req, res) => {
  try {
    const puntosverdes = await db.tb_puntos_verdes.create(req.body);
    res.status(201).json(puntosverdes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});*/
router.post('/', geoLocationController.agregarPuntoVerde);


// Get an  by id
router.get('/:id', async (req, res) => {
  try {
    const puntosverdes = await db.tb_puntos_verdes.findByPk(req.params.id);
    if (puntosverdes) {
      res.status(200).json(puntosverdes);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get puntos verdes by negocio_id
router.get('/negocio/:id_negocio', async (req, res) => {
  try {
    const puntosverdes = await db.tb_puntos_verdes.findAll({
      //where: { negocio_id: req.params.id_negocio, estado: true }
      where: { negocio_id: req.params.id_negocio }
    });
    if (puntosverdes.length > 0) {
      res.status(200).json(puntosverdes);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an  by id
/*
router.put('/:id', async (req, res) => {
  try {
    const puntosverdes = await db.tb_puntos_verdes.findByPk(req.params.id);
    if (puntosverdes) {
      await puntosverdes.update(req.body);
      res.status(200).json(puntosverdes);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});*/
router.put('/:id', geoLocationController.actualizarPuntoVerde);


// Delete an  by id
router.delete('/:id', async (req, res) => {
  try {
    const puntosverdes = await db.tb_puntos_verdes.findByPk(req.params.id);
    if (puntosverdes) {
      await puntosverdes.destroy();
      res.status(204).json();
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an  by id (eliminado lógico)
router.delete('/logico/:id', async (req, res) => {
  try {
    const puntosverdes = await db.tb_puntos_verdes.findByPk(req.params.id);
    if (puntosverdes) {
      await puntosverdes.update({ estado: false });
      res.status(204).json();
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
