const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const db = require('../models');

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './DataSets';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  console.log('Mimetype recibido:', file.mimetype);
  const allowedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/octet-stream',
    'text/plain',
  ];

  if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new Error('Formato de archivo no soportado. Solo se aceptan archivos .csv.'), false);
  }
};

const upload = multer({ storage, fileFilter });

// Crear un nuevo dataset con un archivo .csv
router.post('/', upload.single('archivo'), async (req, res) => {
  const { nombre, descripcion, id_usuario_creador } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Es necesario subir un archivo .csv.' });
    }

    const usuario = await db.tb_usuarios.findByPk(id_usuario_creador);
    if (!usuario) {
      fs.unlinkSync(req.file.path); // Eliminar el archivo si el usuario no existe
      return res.status(404).json({ message: 'El usuario creador no existe.' });
    }

    const filePath = req.file.path;
    const rows = [];
    const columnTypes = {}; 
    const categoricalMappings = {}; 

    // Leer y procesar el archivo CSV
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('error', (err) => {
        console.error('Error al leer el CSV:', err);
        fs.unlinkSync(filePath); // Eliminar archivo en caso de error
        return res.status(500).json({ error: 'Error al procesar el archivo CSV' });
      })
      .on('data', (row) => {
        Object.keys(row).forEach((key) => {
          if (!row[key] || row[key].trim() === '') {
            row[key] = '0';
          }

          if (!columnTypes[key]) {
            columnTypes[key] = !isNaN(row[key]) ? 'numeric' : 'categorical';
          }

          if (columnTypes[key] === 'categorical') {
            if (!categoricalMappings[key]) {
              categoricalMappings[key] = {};
            }

            if (!categoricalMappings[key][row[key]]) {
              categoricalMappings[key][row[key]] = Object.keys(categoricalMappings[key]).length + 1;
            }

            row[key] = categoricalMappings[key][row[key]];
          } else {
            row[key] = parseFloat(row[key]) || 0;
          }
        });

        rows.push(row);
      })
      .on('end', async () => {
        try {
          const nuevoDataset = await db.tb_datasets.create({
            nombre,
            descripcion,
            archivo: filePath,
            id_usuario_creador,
          });

          res.status(201).json({
            message: 'Dataset creado exitosamente.',
            id_dataset: nuevoDataset.id_dataset,
            nombre_dataset: nuevoDataset.nombre,
            descripcion: nuevoDataset.descripcion,
            id_usuario_creador: nuevoDataset.id_usuario_creador,
            nombre_archivo: nuevoDataset.archivo.split('-').slice(1).join('-'),
          });
        } catch (error) {
          console.error(error);
          fs.unlinkSync(filePath);
          res.status(500).json({ error: error.message });
        }
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    // Obtener todas las versiones de modelo
    const versiones = await db.tb_datasets.findAll();

    // Procesar cada versión para extraer el nombre del archivo
    const versionesProcesadas = versiones.map(version => {

      return {
        id_dataset: version.id_dataset,
        nombre_dataset: version.nombre,
        descripcion: version.descripcion,
        id_usuario_creador: version.id_usuario_creador,
        nombre_archivo: version.archivo.split('-').slice(1).join('-'),
      };
    });

    res.status(200).json(versionesProcesadas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener una versión de modelo por ID con solo el nombre del archivo
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const dataset = await db.tb_datasets.findByPk(id);

    if (!dataset) {
      return res.status(404).json({ message: 'Dataset no encontrado.' });
    }

    res.status(201).json({
      id_dataset: nuevoDataset .id_dataset,
      nombre_dataset: nuevoDataset .nombre_modelo,
      descripcion: nuevoDataset .descripcion,
      id_usuario_creador: nuevoDataset .id_usuario_creador,
      nombre_archivo: nuevoDataset .archivo.split('-').slice(1).join('-')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un dataset
router.put('/:id', upload.single('archivo'), async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, id_usuario_creador } = req.body;

  try {
    const datasetExistente = await db.tb_datasets.findByPk(id);
    if (!datasetExistente) {
      return res.status(404).json({ message: 'Dataset no encontrado.' });
    }

    let nuevoArchivo = datasetExistente.archivo;
    if (req.file) {
      const rutaAnterior = datasetExistente.archivo;
      if (rutaAnterior && fs.existsSync(rutaAnterior)) {
        try {
          fs.unlinkSync(rutaAnterior);
        } catch (err) {
          console.warn("No se pudo eliminar el archivo anterior:", err);
        }
      }
      nuevoArchivo = req.file.path;
    }

    await datasetExistente.update({
      nombre: nombre || datasetExistente.nombre,
      descripcion: descripcion || datasetExistente.descripcion,
      id_usuario_creador: id_usuario_creador || datasetExistente.id_usuario_creador,
      archivo: nuevoArchivo,
    });

    const nombreArchivo = nuevoArchivo ? path.basename(nuevoArchivo) : null;

    res.status(200).json({
      message: 'Dataset actualizado exitosamente.',
      id_dataset: datasetExistente.id_dataset,
      nombre: datasetExistente.nombre,
      descripcion: datasetExistente.descripcion,
      id_usuario_creador: datasetExistente.id_usuario_creador,
      nombre_archivo: nombreArchivo ? nombreArchivo.split('-').slice(1).join('-') : null,
    });
  } catch (error) {
    console.error("Error al actualizar dataset:", error);
    res.status(500).json({ error: error.message });
  }
});


// Eliminar un dataset
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const datasetExistente = await db.tb_datasets.findByPk(id);

    if (!datasetExistente) {
      return res.status(404).json({ message: 'Dataset no encontrado.' });
    }

    // Eliminar el archivo físico si existe
    if (fs.existsSync(datasetExistente.archivo)) {
      fs.unlinkSync(datasetExistente.archivo);
    }

    // Eliminar el registro de la base de datos
    await datasetExistente.destroy();

    res.status(200).json({ message: 'Dataset eliminado exitosamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para entrenar y evaluar el modelo
router.post('/train', async (req, res) => {
  try {
    const { id_version } = req.body;
    
    const modelo = await db.tb_versiones_modelos.findByPk(id_version);
    if (!modelo) {
      return res.status(404).json({ error: 'Modelo no encontrado' });
    }

    // Ejecutar el script principal de IA en Python
    const pythonProcess = spawn('python', ['../scripts/train_model.py', modelo.contenido]);

    let scriptOutput = '';
    pythonProcess.stdout.on('data', (data) => {
      scriptOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Error en el script: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      console.log(`Proceso finalizado con código ${code}`);
      res.json({ mensaje: 'Entrenamiento finalizado', salida: scriptOutput });
    });

  } catch (error) {
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
      ruta: nuevoDataset.archivo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
