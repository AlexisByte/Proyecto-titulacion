const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const express = require('express');
const router = express.Router();
const db = require('../models');

// -----------------------------
// ✅ FILTRO DE ARCHIVOS (PRIMERO)
// -----------------------------
const fileFilter = (req, file, cb) => {
  const tiposPermitidos = [
    'application/pdf',
    'application/xml',
    'text/xml'
  ];

  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo PDF o XML.'), false);
  }
};

// -----------------------------
// ✅ MULTER (DESPUÉS DEL FILTRO)
// -----------------------------
const upload = multer({
  dest: 'equifax_uploads/',
  fileFilter
});

// -----------------------------
// PYTHON
// -----------------------------
const pythonExecutable = path.join(
  __dirname,
  '..',
  'venv',
  'Scripts',
  'python.exe'
);

// -----------------------------
// LOG DE ACTIVIDAD
// -----------------------------
const logActivity = async (action, details, userId) => {
  if (!action || !details || userId == null) {
    console.warn('Intento de registrar actividad con campos inválidos:', {
      action,
      details,
      userId
    });
    return;
  }

  try {
    await db.tb_actividad.create({
      accion: action,
      detalles: details,
      id_usuario: userId,
      fecha: new Date()
    });
  } catch (error) {
    console.error('Error al registrar actividad:', error);
  }
};

router.post('/analizar', upload.single('archivo'), async (req, res) => {
  try {
    const archivo = req.file?.path;
    const id_usuario = req.usuario.id_usuario;

    if (!archivo || !id_usuario) {
      return res.status(400).json({
        error: 'Archivo e id_usuario son obligatorios'
      });
    }

    await logActivity(
      'equifax_analisis_inicio',
      'Inicio análisis Equifax',
      id_usuario
    );

    // -----------------------------
    // PYTHON ÚNICO: PROCESAR EQUIFAX
    // -----------------------------
    const extractor = spawn(pythonExecutable, [
      'scripts/procesar_equifax.py',
      archivo
    ]);

    let salida = '';
    let error = '';

    extractor.stdout.on('data', d => salida += d.toString());
    extractor.stderr.on('data', d => error += d.toString());

    extractor.on('close', async (code) => {
      if (code !== 0) {
        await logActivity(
          'equifax_extraccion_fallida',
          error,
          id_usuario
        );
        return res.status(500).json({
          error: 'No se pudo procesar Equifax'
        });
      }

      let resultado;
      try {
        resultado = JSON.parse(salida);
      } catch {
        return res.status(500).json({
          error: 'Salida inválida del script Equifax'
        });
      }

      const datos = require('fs').readFileSync(
        resultado.archivo_json,
        'utf8'
      );

      const datosEquifax = JSON.parse(datos);

      // -----------------------------
      // GUARDAR EN BD
      // -----------------------------
      await db.tb_reportes_equifax.create({
        id_usuario,

        nombre_reporte: datosEquifax.nombre_reporte,

        score_equifax: Number(datosEquifax.score_equifax),
        score_reglas: Number(datosEquifax.score_reglas),
        score_interno: Number(datosEquifax.score_interno),

        riesgo_final: datosEquifax.riesgo_final,

        datos_equifax: datosEquifax.datos_equifax || datosEquifax,
        archivo_origen: archivo
      });

      await logActivity(
        'equifax_decision_riesgo',
        `Score Promedio: ${datosEquifax.score_promedio} - ${datosEquifax.riesgo}`,
        id_usuario
      );

      // -----------------------------
      // RESPUESTA FINAL
      // -----------------------------
      return res.json({
        mensaje: 'Análisis Equifax completado',
        analisis_riesgo: {
          nombre_reporte: datosEquifax.nombre_reporte,
          score_equifax: Number(datosEquifax.score_equifax),
          score_reglas: Number(datosEquifax.score_reglas),
          score_final: Number(datosEquifax.score_interno),
          riesgo: datosEquifax.riesgo_final,
          datos_equifax: datosEquifax.datos_equifax || datosEquifax,
          factores_negativos: [] // futuro (reglas explicables)
        }
      });
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});


// -----------------------------
// MANEJO DE ERROR DE MULTER
// -----------------------------
router.use((err, req, res, next) => {
  if (err.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;
