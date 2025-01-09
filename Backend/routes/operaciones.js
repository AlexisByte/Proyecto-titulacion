const express = require('express');
const router = express.Router();
const greencoinsController = require('../controllers/greencoinsController');

// Ruta para registrar reciclaje
//router.post('/registrar-reciclaje', greencoinsController.registrarReciclaje);

// Ruta para canjear oferta
router.post('/canjear-oferta', greencoinsController.canjearOferta);

// Ruta para obtener historial de ofertas de un ciudadano
router.get('/historial-ofertas/:correo_electronico', greencoinsController.obtenerHistorialOfertasCiudadano);

// Ruta para validar código de canje
router.post('/validar-codigo-canje', greencoinsController.validarCodigoCanje);

module.exports = router;