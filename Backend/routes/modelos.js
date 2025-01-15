const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../models');
const fs = require('fs');

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // Carpeta donde se guardarán los archivos
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Nombre único para cada archivo
  },
});

const fileFilter = (req, file, cb) => {
  console.log('Mimetype recibido:', file.mimetype); // Agrega esta línea para depuración
  if (file.mimetype === 'text/x-python' || file.mimetype === 'application/x-python-code' || file.mimetype === 'application/octet-stream') {
    cb(null, true); // Aceptar el archivo
  } else {
    cb(new Error('Formato de archivo no soportado. Solo se aceptan archivos .py.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

router.get('/', async (req, res) => {
  try {
    // Obtener todas las versiones de modelo
    const versiones = await db.tb_versiones_modelos.findAll({
      attributes: ['id_version', 'nombre_modelo', 'version', 'descripcion', 'id_usuario_creador', 'contenido'], // Incluye el campo contenido
    });

    // Procesar cada versión para extraer el nombre del archivo
    const versionesProcesadas = versiones.map(version => {

      return {
        id_version: version.id_version,
        nombre_modelo: version.nombre_modelo,
        version: version.version,
        descripcion: version.descripcion,
        id_usuario_creador: version.id_usuario_creador,
        nombre_archivo: version.contenido.split('-').slice(1).join('-'),
      };
    });

    res.status(200).json(versionesProcesadas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
      id_version: nuevaVersion.id_version,
      nombre_modelo: nuevaVersion.nombre_modelo,
      version: nuevaVersion.version,
      descripcion: nuevaVersion.descripcion,
      id_usuario_creador: nuevaVersion.id_usuario_creador,
      nombre_archivo: nuevaVersion.contenido.split('-').slice(1).join('-')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener una versión de modelo por ID con solo el nombre del archivo
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const version = await db.tb_versiones_modelos.findByPk(id);

    if (!version) {
      return res.status(404).json({ message: 'Versión de modelo no encontrada.' });
    }

    // Convertir el contenido del buffer a cadena si es necesario
    let nombreArchivo = null;
    if (version.contenido) {
       // Extraer solo el nombre del archivo
       const archivoCompleto = path.basename(version.contenido);
       nombreArchivo = archivoCompleto.split('-').slice(1).join('-'); // Quitar el prefijo de la marca de tiempo
    }

    res.status(200).json({
      id_version: version.id_version,
      nombre_modelo: version.nombre_modelo,
      version: version.version,
      descripcion: version.descripcion,
      id_usuario_creador: version.id_usuario_creador,
      nombre_archivo: version.contenido.split('-').slice(1).join('-'),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', upload.single('contenido'), async (req, res) => {
  const { id } = req.params;
  const { nombre_modelo, version, descripcion, id_usuario_creador } = req.body;

  try {
    // Buscar la versión existente por ID
    const versionExistente = await db.tb_versiones_modelos.findByPk(id);

    if (!versionExistente) {
      return res.status(404).json({ message: 'Versión de modelo no encontrada.' });
    }

    // Si se sube un archivo, procesarlo
    let nuevoContenido = versionExistente.contenido; // Mantener el archivo existente si no se sube uno nuevo
    if (req.file) {
      // Eliminar el archivo anterior si existe
      if (versionExistente.contenido && fs.existsSync(versionExistente.contenido)) {
        fs.unlinkSync(versionExistente.contenido); // Borrar el archivo antiguo
      }
      nuevoContenido = req.file.path; // Usar la ruta del nuevo archivo
    }

    // Actualizar los datos
    await versionExistente.update({
      nombre_modelo,
      version,
      descripcion,
      id_usuario_creador,
      contenido: nuevoContenido, // Actualizamos la ruta del archivo
    });

    // Extraemos el nombre del archivo solo para la respuesta
    const nombreArchivo = path.basename(nuevoContenido);

    res.status(200).json({
      message: 'Versión de modelo actualizada exitosamente.',
      id_version: versionExistente.id_version,
      nombre_modelo: versionExistente.nombre_modelo,
      version: versionExistente.version,
      descripcion: versionExistente.descripcion,
      id_usuario_creador: versionExistente.id_usuario_creador,
      nombre_archivo: nombreArchivo.split('-').slice(1).join('-'), // Nombre del archivo actualizado
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar el modelo por ID
    const versionExistente = await db.tb_versiones_modelos.findByPk(id);

    if (!versionExistente) {
      return res.status(404).json({ message: 'Modelo no encontrado.' });
    }

    // Si estás almacenando la ruta del archivo, elimina el archivo físico
    if (versionExistente.contenido && fs.existsSync(versionExistente.contenido)) {
      fs.unlinkSync(versionExistente.contenido);
    }

    // Eliminar el registro de la base de datos
    await versionExistente.destroy();

    res.status(200).json({ message: 'Modelo eliminado exitosamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
