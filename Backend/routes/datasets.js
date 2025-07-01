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
      id_usuario: userId
    });
  } catch (error) {
    console.error('Error al registrar actividad:', error);
  }
};

// Crear un nuevo dataset con un archivo .csv
router.post('/', upload.single('archivo'), async (req, res) => {
  const { nombre, descripcion, id_usuario_creador } = req.body;
  let filePath = null;

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
          
          fs.unlink(filePath, (err) => {
            if (err) console.error('Error al eliminar el archivo:', err);
          });

          logActivity('dataset_error', `Error al procesar dataset ${nombre}: ${stderrData || stdoutData}`, id_usuario_creador);
          return;
        }

        const processedFilePath = stdoutData.trim();
        console.log(`Archivo procesado correctamente: ${processedFilePath}`);

        // Leer y parsear metadata
        const metadataContenido = fs.readFileSync(processedFilePath, 'utf8');
        const metadataArray = JSON.parse(metadataContenido);  // Es un arreglo
        const metadata = metadataArray[0];

        // Armar el objeto
        const inf_columnas_obj = {
          num_columnas: metadata.columnas_categoricas.length + metadata.columnas_numericas.length,
          columnas_categoricas: metadata.columnas_categoricas,
          columnas_numericas: metadata.columnas_numericas
        };

        // Convertir a string para guardarlo como texto
        const inf_columnas = JSON.stringify(inf_columnas_obj);
        console.log(inf_columnas)

        // Guardar en la base de datos
        const dataset = await db.tb_datasets.create({
          nombre: nombre,
          descripcion: descripcion,
          archivo: processedFilePath,
          inf_columnas: inf_columnas,  // Guardado como texto
          id_usuario_creador: id_usuario_creador
        });

        // Registrar actividad
        logActivity('dataset_creado', `Dataset ${nombre} creado exitosamente`, id_usuario_creador);
        
        res.status(201).json({ message: 'Procesamiento completado.', dataset });
        
      } catch (error) {
        console.error('Error al finalizar el procesamiento:', error);
        
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
    const datasets = await db.tb_datasets.findAll();

    const listaProcesada = datasets.map((dataset) => {
      let info;
      try {
        info = JSON.parse(dataset.inf_columnas);
      } catch (error) {
        console.warn(`Error leyendo metadata del dataset ID ${dataset.id_dataset}: ${error.message}`);
      }

      return {
        id_dataset: dataset.id_dataset,
        nombre_dataset: dataset.nombre,
        descripcion: dataset.descripcion,
        num_columnas: info?.num_columnas || null,
        columnas_categoricas: info?.columnas_categoricas || [],
        columnas_numericas: info?.columnas_numericas || [],
        nombre_archivo: path.basename(dataset.archivo || ''),
        fecha_creacion: dataset.createdAt,
        error_metadata: info ? false : true
      };
    });

    res.status(200).json(listaProcesada);
  } catch (error) {
    console.error('Error al obtener todos los datasets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener un dataset por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const dataset = await db.tb_datasets.findByPk(id);

    if (!dataset) {
      return res.status(404).json({ message: 'Dataset no encontrado.' });
    }

    let info;
    let error_metadata = false;

    try {
      const metadataContenido = fs.readFileSync(dataset.archivo, 'utf8');
      let metadataRaw = JSON.parse(metadataContenido);
      const metadata = Array.isArray(metadataRaw) ? metadataRaw[0] : metadataRaw;

      info = {
        num_columnas: (metadata.columnas_categoricas?.length || 0) + (metadata.columnas_numericas?.length || 0),
        columnas_categoricas: metadata.columnas_categoricas || [],
        columnas_numericas: metadata.columnas_numericas || [],
      };
    } catch (error) {
      console.warn(`Error leyendo metadata para el dataset ID ${id}: ${error.message}`);
      error_metadata = true;
    }

    const datasetProcesado = {
      id_dataset: dataset.id_dataset,
      nombre_dataset: dataset.nombre,
      descripcion: dataset.descripcion,
      num_columnas: info?.num_columnas || null,
      columnas_categoricas: info?.columnas_categoricas || [],
      columnas_numericas: info?.columnas_numericas || [],
      nombre_archivo: path.basename(dataset.archivo || ''),
      fecha_creacion: dataset.createdAt,
      error_metadata
    };

    return res.status(200).json(datasetProcesado);

  } catch (error) {
    console.error('Error en GET /datasets/:id:', error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un dataset
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { id_usuario } = req.body;

  try {
    const dataset = await db.tb_datasets.findByPk(id);

    if (!dataset) {
      return res.status(404).json({ message: 'Dataset no encontrado.' });
    }

    const rutaMetadata = dataset.archivo;

    // Verificar que el archivo metadata.json existe
    if (!fs.existsSync(rutaMetadata)) {
      return res.status(404).json({ message: 'Archivo metadata.json no encontrado.' });
    }

    // Leer y parsear el archivo metadata.json
    const metadataContenido = fs.readFileSync(rutaMetadata, 'utf8');
    const metadata = JSON.parse(metadataContenido);

    const archivosAEliminar = [
      metadata.archivo_original,
      metadata.archivo_procesado,
      rutaMetadata // Eliminar también el archivo metadata.json
    ];

    archivosAEliminar.forEach((ruta) => {
      if (ruta && fs.existsSync(ruta)) {
        fs.unlink(ruta, (err) => {
          if (err) {
            console.error(`Error al eliminar archivo ${ruta}:`, err);
          }
        });
      }
    });

    // Eliminar registro de la base de datos
    await dataset.destroy();

    // Registrar actividad
    if (id_usuario) {
      logActivity('dataset_eliminado', `Dataset ${dataset.nombre} eliminado`, id_usuario);
    }

    res.status(200).json({ message: 'Dataset eliminado correctamente.' });

  } catch (error) {
    console.error(`Error en DELETE /datasets/${id}:`, error);
    res.status(500).json({ error: 'Error interno al eliminar el dataset.' });
  }
});


module.exports = router;
