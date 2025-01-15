const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../models');

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../uploads'); // Carpeta donde se guardarán los archivos
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Nombre único para cada archivo
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/x-python-script') {
    cb(null, true); // Acepta solo archivos con extensión `.py`
  } else {
    cb(new Error('Formato de archivo no soportado. Solo se aceptan archivos .py.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

// Crear una nueva versión de modelo con un archivo .py
router.post('/', upload.single('contenido'), async (req, res) => {
  const { nombre_modelo, version, descripcion, id_usuario_creador } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Es necesario subir un archivo .py.' });
    }

    const nuevaVersion = await db.tb_versiones_modelos.create({
      nombre_modelo,
      version,
      descripcion,
      id_usuario_creador,
      contenido: req.file.path, // Guardar la ruta del archivo en la base de datos
    });

    res.status(201).json({
      message: 'Versión de modelo creada exitosamente.',
      version: nuevaVersion,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener una versión de modelo por ID con contenido .py
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const version = await db.tb_versiones_modelos.findByPk(id);

    if (!version) {
      return res.status(404).json({ message: 'Versión de modelo no encontrada.' });
    }

    res.status(200).json(version);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Descargar el archivo .py
router.get('/:id/download', async (req, res) => {
  const { id } = req.params;

  try {
    const version = await db.tb_versiones_modelos.findByPk(id);

    if (!version || !version.contenido) {
      return res.status(404).json({ message: 'Archivo no encontrado para esta versión de modelo.' });
    }

    res.download(version.contenido, err => {
      if (err) {
        res.status(500).json({ error: 'Error al descargar el archivo.' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
