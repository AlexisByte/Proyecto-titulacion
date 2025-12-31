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
  console.log('Mimetype recibido:', file.mimetype); // Depuración

  const allowedTypes = [
    'text/x-python',
    'application/x-python-code',
    'application/octet-stream',
    'text/plain', // Algunos navegadores envían archivos .py como text/plain
  ];

  if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.py')) {
    cb(null, true);
  } else {
    cb(new Error('Formato de archivo no soportado. Solo se aceptan archivos .py.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

// Registro de actividad
const logActivity = async (action, details, userId) => {
  try {
    await db.tb_actividad.create({
      accion: action,
      detalles: details,
      id_usuario: userId
    });
  } catch (error) {
    console.error('Error al registrar actividad:', error);
  }
};

router.get('/', async (req, res) => {
  try {
    // Obtener todas las versiones de modelo
    const versiones = await db.tb_versiones_modelos.findAll({
      attributes: ['id_version', 'nombre_modelo', 'version', 'descripcion', 'id_usuario_creador', 'contenido'],
      order: [['id_version', 'ASC']], // <-- orden descendente
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

    const usuario = await db.tb_usuarios.findByPk(id_usuario_creador);
    if (!usuario) {
        return res.status(404).json({ message: 'El usuario creador no existe.' });
    }

    const nuevaVersion = await db.tb_versiones_modelos.create({
      nombre_modelo,
      version,
      descripcion,
      id_usuario_creador,
      contenido: req.file.path, // Guardar la ruta del archivo en la base de datos
    });

    await logActivity('Modelo IA creado', `Modelo IA ${nuevaVersion.nombre_modelo} creado`, id_usuario_creador);


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
    await logActivity('Error creando Modelo IA', error.message, id_usuario_creador);
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

    // Si se sube un nuevo archivo, eliminar el antiguo
    let nuevoContenido = versionExistente.contenido;
    if (req.file) {
      const rutaAnterior = versionExistente.contenido;
      if (rutaAnterior && fs.existsSync(rutaAnterior)) {
        try {
          fs.unlinkSync(rutaAnterior); // Intentar eliminar el archivo anterior
        } catch (err) {
          console.warn("No se pudo eliminar el archivo anterior:", err);
        }
      }
      nuevoContenido = req.file.path; // Usar la nueva ruta
    }

    // Actualizar solo los campos proporcionados
    await versionExistente.update({
      nombre_modelo: nombre_modelo || versionExistente.nombre_modelo,
      version: version || versionExistente.version,
      descripcion: descripcion || versionExistente.descripcion,
      id_usuario_creador: id_usuario_creador || versionExistente.id_usuario_creador,
      contenido: nuevoContenido, // Mantener el archivo existente si no se subió uno nuevo
    });

    // Extraer el nombre del archivo para la respuesta
    const nombreArchivo = nuevoContenido ? path.basename(nuevoContenido) : null;

    await logActivity('Modelo IA modificado', `Modelo IA ${id} modificado`, id_usuario_creador);

    res.status(200).json({
      message: 'Versión de modelo actualizada exitosamente.',
      id_version: versionExistente.id_version,
      nombre_modelo: versionExistente.nombre_modelo,
      version: versionExistente.version,
      descripcion: versionExistente.descripcion,
      id_usuario_creador: versionExistente.id_usuario_creador,
      nombre_archivo: nombreArchivo ? nombreArchivo.split('-').slice(1).join('-') : null, // Si hay archivo, devolver solo su nombre
    });

  } catch (error) {
    console.error("Error al actualizar modelo:", error);
    await logActivity('Error modificando Modelo IA', error.message, id_usuario_creador);
    res.status(500).json({ error: error.message });
  }
});

// Obtener una versión de modelo por ID con solo el nombre del archivo
router.get('/ruta/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const version = await db.tb_versiones_modelos.findByPk(id);

    if (!version) {
      return res.status(404).json({ message: 'Versión de modelo no encontrada.' });
    }

    res.status(200).json({
      ruta: version.contenido,
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
    
    await logActivity('Modelo IA eliminado', `Modelo IA ${id} eliminado`, req.usuario.id_usuario);

    res.status(200).json({ message: 'Modelo eliminado exitosamente.' });
  } catch (error) {
    await logActivity('Error eliminado Modelo IA', error.message, req.usuario.id_usuario);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
