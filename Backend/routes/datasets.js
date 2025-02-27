const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const db = require('../models');


// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './DataSets'); // Carpeta donde se guardarán los archivos
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Nombre único para cada archivo
  },
});

const fileFilter = (req, file, cb) => {
  console.log('Mimetype recibido:', file.mimetype); // Depuración

  const allowedTypes = [
    'text/csv',           // MIME type común para archivos .csv
    'application/vnd.ms-excel', // MIME type para archivos .csv en algunos navegadores
    'application/octet-stream', // MIME type genérico
  ];

  // Comprobar si el tipo MIME o la extensión del archivo corresponde a .csv
  if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new Error('Formato de archivo no soportado. Solo se aceptan archivos .csv.'), false);
  }
};


// Configurar límites para archivos grandes
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 500, // 500MB límite
    fieldSize: 1024 * 1024 * 500 // 500MB para campos de formulario
  }
});

// Registro de actividad
const logActivity = async (action, details, userId) => {
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

// Crear un nuevo dataset con un archivo .csv
router.post('/', upload.single('archivo'), async (req, res) => {
  const { nombre, descripcion, id_usuario_creador } = req.body;
  let filePath = null;
  let responseStatus = 202; // Accepted - proceso iniciado

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Es necesario subir un archivo .csv.' });
    }

    filePath = req.file.path;
    const fileSize = fs.statSync(filePath).size / (1024 * 1024); // Tamaño en MB
    console.log(`Archivo recibido: ${filePath}, Tamaño: ${fileSize.toFixed(2)} MB`);

    const usuario = await db.tb_usuarios.findByPk(id_usuario_creador);
    if (!usuario) {
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error al eliminar el archivo:', err);
      });
      return res.status(404).json({ message: 'El usuario creador no existe.' });
    }

    // Crear un registro temporal para el dataset
    const datasetTemporal = await db.tb_datasets.create({
      nombre: nombre,
      descripcion: `${descripcion} (Procesando...)`,
      archivo: filePath,
      id_usuario_creador,
      estado: 'procesando'
    });

    // Responder inmediatamente al cliente
    res.status(responseStatus).json({
      message: 'Procesamiento de dataset iniciado. Recibirás una notificación cuando termine.',
      id_dataset: datasetTemporal.id_dataset,
      estado: 'procesando'
    });

    // Ejecutar el script de Python para procesar el CSV de manera asíncrona
    const pythonProcess = spawn('python', [
      'scripts/procesar_csv.py', 
      filePath,
      '20000' // Tamaño de chunk como segundo argumento
    ]);

    let stdoutData = '';
    let stderrData = '';

    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
      console.error(`Error en Python: ${data}`);
    });

    pythonProcess.on('close', async (code) => {
      try {
        console.log(`Script Python terminó con código: ${code}`);
        
        if (code !== 0 || stderrData.includes('ERROR') || stdoutData.includes('ERROR')) {
          console.error('Error en el procesamiento:', stderrData || stdoutData);
          
          // Actualizar el dataset a estado de error
          await datasetTemporal.update({
            descripcion: `${descripcion} (Error en procesamiento)`,
            estado: 'error'
          });
          
          logActivity('dataset_error', `Error al procesar dataset ${nombre}: ${stderrData || stdoutData}`, id_usuario_creador);
          return;
        }

        const processedFilePath = stdoutData.trim();
        console.log(`Archivo procesado correctamente: ${processedFilePath}`);

        // Actualizar el dataset con la información final
        await datasetTemporal.update({
          descripcion: descripcion,
          archivo: processedFilePath,
          estado: 'completado'
        });

        // Registrar actividad
        logActivity('dataset_creado', `Dataset ${nombre} creado exitosamente`, id_usuario_creador);
        
        // Aquí podrías implementar una notificación al usuario (email, websocket, etc.)
        
      } catch (error) {
        console.error('Error al finalizar el procesamiento:', error);
        
        // Actualizar estado a error
        await datasetTemporal.update({
          descripcion: `${descripcion} (Error: ${error.message})`,
          estado: 'error'
        });
        
        logActivity('dataset_error', `Error al finalizar dataset ${nombre}: ${error.message}`, id_usuario_creador);
      }
    });

  } catch (error) {
    console.error('Error en la ruta POST /datasets:', error);
    
    // Si ya respondimos al cliente, no podemos enviar otra respuesta
    if (responseStatus !== 202) {
      // Limpiar el archivo si ocurrió un error
      if (filePath && fs.existsSync(filePath)) {
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error('Error al eliminar el archivo:', unlinkErr);
        });
      }
      
      res.status(500).json({ error: error.message });
    }
  }
});

// Obtener todos los datasets
router.get('/', async (req, res) => {
  try {
    const datasets = await db.tb_datasets.findAll({
      order: [['createdAt', 'DESC']]
    });

    // Procesar cada dataset
    const datasetsProcesados = datasets.map(dataset => {
      let nombreArchivo = path.basename(dataset.archivo || '');
      
      return {
        id_dataset: dataset.id_dataset,
        nombre_dataset: dataset.nombre,
        descripcion: dataset.descripcion,
        id_usuario_creador: dataset.id_usuario_creador,
        estado: dataset.estado || 'completado', // Para compatibilidad con registros antiguos
        nombre_archivo: nombreArchivo,
        fecha_creacion: dataset.createdAt
      };
    });

    res.status(200).json(datasetsProcesados);
  } catch (error) {
    console.error('Error en GET /datasets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener un dataset por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const dataset = await db.tb_datasets.findByPk(id);

    if (!dataset) {
      return res.status(404).json({ message: 'Dataset no encontrado.' });
    }

    let nombreArchivo = path.basename(dataset.archivo || '');

    res.status(200).json({
      id_dataset: dataset.id_dataset,
      nombre_dataset: dataset.nombre,
      descripcion: dataset.descripcion,
      id_usuario_creador: dataset.id_usuario_creador,
      estado: dataset.estado || 'completado',
      nombre_archivo: nombreArchivo,
      fecha_creacion: dataset.createdAt
    });
  } catch (error) {
    console.error(`Error en GET /datasets/${id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un dataset
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { id_usuario } = req.body; // Asume que envías el ID del usuario que realiza la eliminación

  try {
    const dataset = await db.tb_datasets.findByPk(id);

    if (!dataset) {
      return res.status(404).json({ message: 'Dataset no encontrado.' });
    }

    // Eliminar archivo físico
    if (dataset.archivo && fs.existsSync(dataset.archivo)) {
      fs.unlink(dataset.archivo, (err) => {
        if (err) console.error('Error al eliminar el archivo físico:', err);
      });
    }

    // Eliminar registro en BD
    await dataset.destroy();

    // Registrar actividad
    if (id_usuario) {
      logActivity('dataset_eliminado', `Dataset ${dataset.nombre} eliminado`, id_usuario);
    }

    res.status(200).json({ message: 'Dataset eliminado correctamente.' });
  } catch (error) {
    console.error(`Error en DELETE /datasets/${id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener una versión de modelo por ID conla ruta del archivo
router.get('/ruta/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const dataset = await db.tb_datasets.findByPk(id);

    if (!dataset) {
      return res.status(404).json({ message: 'Dataset no encontrado.' });
    }

    res.status(201).json({
      ruta: dataset.archivo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
