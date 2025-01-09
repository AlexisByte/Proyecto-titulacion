// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { obtenerNotificaciones, marcarNotificacionesLeidas } = require('../controllers/notificationController');

router.get('/:ciudadano_id', obtenerNotificaciones);
router.put('/:ciudadano_id/leidas', marcarNotificacionesLeidas);

module.exports = router;