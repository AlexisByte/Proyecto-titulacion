// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const axios = require('axios');

router.post('/register/ciudadano', authController.registerCiudadano);
router.post('/register/negocio', authController.registerNegocio);
router.post('/register/admin', authController.registerAdmin);
router.post('/login', authController.login);

router.post('/validate-ruc', async (req, res) => {
    const { ruc } = req.body;
    const token = 'WVbyMt9ku7ztwE9Z0OEOmCj92ZDv5qjphAxCXlcI'; // Reemplaza esto con tu token real
  
    try {
      const response = await axios.get(`https://webservices.ec/api/ruc/${ruc}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        maxBodyLength: Infinity
      });
      
      const mainData = response.data.data.main[0];
    const additionalData = response.data.data.addit;

    // Intentar obtener el propietario
    const propietario = mainData.representantesLegales && mainData.representantesLegales.length > 0 ? mainData.representantesLegales[0].nombre : mainData.agenteRepresentante || null;

    // Intentar obtener el tipo de negocio
    const tipoNegocio = mainData.actividadEconomicaPrincipal || mainData.categoria || null;

    const result = {
      nombreNegocio: mainData.razonSocial || null,
      propietario: propietario,
      tipoNegocio: tipoNegocio,
      direccion: additionalData.length > 0 ? additionalData[0].direccionCompleta : null,
      fechaCreacion: mainData.informacionFechasContribuyente ? mainData.informacionFechasContribuyente.fechaInicioActividades : null,
      // Devolver todos los datos
      //allData: response.data.data
    };

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener datos del RUC - RUC Inválida' });
    }
  });

module.exports = router;
