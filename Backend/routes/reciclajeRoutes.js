const express = require('express');
const router = express.Router();
const reciclajeController = require('../controllers/reciclajeController');

router.post('/registrar', reciclajeController.registrarReciclaje);
router.get('/historial/ciudadano/:ciudadano_id', reciclajeController.obtenerHistorialCiudadano);
router.get('/historial/negocio/:negocio_id', reciclajeController.obtenerHistorialNegocio);

module.exports = router;
