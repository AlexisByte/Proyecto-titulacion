const express = require('express');
const router = express.Router();
const db = require('../models');
const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs');
const { FLOAT } = require('sequelize');
const path = require('path');
const multer = require('multer');
const fsPromises = require('fs').promises;

// Registro de actividad
const logActivity = async (action, details, userId) => {
  if (!action || !details || userId == null) {
    console.warn('Intento de registrar actividad con campos inválidos:', { action, details, userId });
    return; // no registrar si falta algún campo obligatorio
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

router.post('/entrenamiento', async (req, res) => {
    let { id_version, id_dataset, skip_columns,test_size,random_state,id_usuario_creador } = req.body;

    try {
        // Verificar existencia de los registros
        const version = await db.tb_versiones_modelos.findByPk(id_version, { attributes: ['contenido'] });
        const dataset = await db.tb_datasets.findByPk(id_dataset, { attributes: ['archivo'] });

        if (!version) {
            return res.status(404).json({ message: 'La versión del modelo no existe.' });
        }
        if (!dataset) {
            return res.status(404).json({ message: 'El dataset no existe.' });
        }

        // Verificar si ya existe un resultado para esa combinación
        const existeResultado = await db.tb_resultados_entrenamiento.findOne({
        where: {
            id_version,
            id_dataset
        }
        });

        if (existeResultado) {
            logActivity(
                'entrenamiento_duplicado',
                `Intento de entrenar con combinación existente: versión ${id_version}, dataset ${id_dataset}`,
                id_usuario_creador
            );
            return res.status(409).json({
                message: 'Ya existe un resultado para esta combinación de versión y dataset.',
                existente: existeResultado
            });
        }

        // Obtener rutas desde la base de datos
        const modeloRuta = version.contenido;
        const metadataPath = dataset.archivo; // ruta local completa al archivo .json
        
        // Leer el archivo de metadata de forma síncrona con await
        const contenido = await fsPromises.readFile(metadataPath, 'utf8');
        const metadata = JSON.parse(contenido)[0];
        const datasetRuta = metadata.archivo_procesado;
        console.log("Ruta dataset procesado 1: "+datasetRuta)

        // Verificar existencia de archivos en el sistema
        try {
            if (!fs.existsSync(modeloRuta)) {
                await logActivity('entrenamiento_error_archivo', `Modelo no encontrado en ruta ${modeloRuta}`, id_usuario_creador);
                return res.status(400).json({ message: 'El archivo del modelo no existe en la ruta especificada.' });
            }
            if (!fs.existsSync(datasetRuta)) {
                await logActivity('entrenamiento_error_archivo', `Dataset no encontrado en ruta ${datasetRuta}`, id_usuario_creador);
                return res.status(400).json({ message: 'El archivo del dataset no existe en la ruta especificada.' });
            }
        } catch (error) {
            return res.status(500).json({ message: 'Error al verificar la existencia de los archivos: ' + error.message });
        }

        // Ejecutar script de Python
        const pythonProcess = spawn('python', [
            'scripts/entrenar_ia.py',
            datasetRuta,
            modeloRuta,
            String(parseInt(skip_columns) || 0), // Si es undefined, usa 0
            String(parseFloat(test_size) || 0.2), // Si no es un número, usa 0.2
            String(parseInt(random_state) || 42), // Si no es un número, usa 42
            metadataPath
        ]);
        
        let resultadoPython = '';
        let errorPython = '';

        pythonProcess.stdout.on('data', (data) => {
            resultadoPython += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorPython += data.toString();
        });

        pythonProcess.on('error', (error) => {
            console.error('Error al ejecutar el script de Python:', error);
            return res.status(500).json({ message: 'No se pudo ejecutar el entrenamiento.' });
        });

        pythonProcess.on('close', async (code) => {
            if (code !== 0) {
                await logActivity(
                    'entrenamiento_fallido',
                    `Error en script de entrenamiento Python. Código ${code}. Error: ${errorPython}`,
                    id_usuario_creador
                );
                console.error(`Error en el script de Python: ${errorPython}`);
                return res.status(500).json({ message: 'Error en el entrenamiento del modelo.', error: errorPython });
            }
            //console.log("Resultados antes: "+resultadoPython.trim())
            try {
                const resultados = JSON.parse(resultadoPython.trim());
                console.log("Resultados: "+JSON.stringify(resultados, null, 4))
                if (Object.values(resultados).some(val => val === null || val === undefined)) {
                    await logActivity(
                        'entrenamiento_resultado_invalido',
                        `Resultados nulos o inválidos para versión ${id_version} y dataset ${id_dataset}`,
                        id_usuario_creador
                    );
                    return res.status(500).json({ message: 'Resultados del entrenamiento inválidos.' });
                }

                // Guardar en la base de datos
                const nuevoResultado = await db.tb_resultados_entrenamiento.create({
                    id_version,
                    id_dataset,
                    matriz_confusion: JSON.stringify({
                        etiquetas: resultados.clases,
                        matriz: resultados.matriz_confusion
                    }),                    
                    precision: parseFloat(resultados.precision.toFixed(4)),
                    exactitud: parseFloat(resultados.exactitud.toFixed(4)),
                    recall: parseFloat(resultados.recall.toFixed(4)),
                    f1_score: parseFloat(resultados.f1_score.toFixed(4)),
                    modelo_entrenado: resultados.path
                });
                await logActivity(
                'entrenamiento_exitoso',
                `Entrenamiento completado para versión ${id_version} y dataset ${id_dataset}. ID resultado: ${nuevoResultado.id_resultado}`,
                id_usuario_creador
                );
                res.status(201).json({ message: 'Entrenamiento completado.', nuevoResultado });
            } catch (error) {
                await logActivity(
                    'entrenamiento_error_resultado',
                    `Error al procesar resultados de entrenamiento: ${error.message}`,
                    id_usuario_creador
                );
                console.error('Error procesando resultados:', error);
                res.status(500).json({ message: 'Error procesando resultados del entrenamiento.' });
            }
        });

    } catch (error) {
        await logActivity(
            'entrenamiento_error_general',
            `Error general en endpoint /entrenamiento: ${error.message}`,
            id_usuario_creador
        );
        console.error('Error en el entrenamiento:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// Obtener todos los resultados de entrenamiento
router.get('/', async (req, res) => {
  try {
    const resultados = await db.tb_resultados_entrenamiento.findAll({
      include: [
        {
          model: db.tb_versiones_modelos,
          as: 'modelo_version',   // Alias correcto aquí
          attributes: ['nombre_modelo']
        },
        {
          model: db.tb_datasets,
          as: 'dataset',          // Alias correcto aquí
          attributes: ['nombre']
        }
      ]
    });

    return res.status(200).json(resultados);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener los resultados', error: error.message });
  }
});

// Obtener un resultado específico por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await db.tb_resultados_entrenamiento.findByPk(id);
        if (resultado) {
            return res.status(200).json(resultado);
        } else {
            return res.status(404).json({ message: `No se encontró el resultado con ID: ${id}` });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener el resultado', error: error.message });
    }
});

// Eliminar un resultado de entrenamiento por ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { id_usuario } = req.body;
    try {
        const resultado = await db.tb_resultados_entrenamiento.findByPk(id);
        if (resultado) {
            await resultado.destroy();
            await logActivity(
                'eliminar_resultado',
                `Eliminado resultado con ID ${id}, versión ${resultado.id_version}, dataset ${resultado.id_dataset}`,
                id_usuario
            );
            return res.status(200).json({ message: `Resultado con ID: ${id} eliminado correctamente.` });
        } else {
            return res.status(404).json({ message: `No se encontró el resultado con ID: ${id}` });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar el resultado', error: error.message });
    }
});

//Clasificar
// Carpeta temporal para guardar CSVs subidos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './archivos_temporales'); // Carpeta donde se guardarán los archivos
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Nombre único para cada archivo
  },
});
// multer con filtro para aceptar solo archivos CSV
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
    fileSize: 1024 * 1024 * 250, // 500MB límite
    fieldSize: 1024 * 1024 * 250 // 500MB para campos de formulario
  }
});

router.post('/clasificar/csv', upload.single('archivo'), async (req, res) => {
    try {
        const { id_modelo_entrenado,id_usuario_creador } = req.body;
        const archivo = req.file.path;

        if (!archivo) {
            await logActivity('clasificacion_fallida', 'No se subió ningún archivo CSV.', id_usuario_creador);
            return res.status(400).json({ error: 'No se subió ningún archivo' });
        }

        // Aquí se debería obtener la ruta al modelo usando `id_modelo_entrenado`
        const resultados = await db.tb_resultados_entrenamiento.findByPk(id_modelo_entrenado);

         if (!resultados) {
            await logActivity('clasificacion_fallida', `Modelo de entrenamiento ID ${id_modelo_entrenado} no encontrado.`, id_usuario_creador);
            return res.status(404).json({ error: 'Modelo entrenado no encontrado' });
        }

        const modelo_path = resultados.modelo_entrenado
        const dataset = await db.tb_datasets.findByPk(resultados.id_dataset);
        const metadataPath = dataset.archivo

       if (!fs.existsSync(modelo_path)) {
            await logActivity('clasificacion_fallida', 'El archivo del modelo entrenado no existe.', id_usuario_creador);
            return res.status(404).json({ error: 'Modelo no encontrado' });
        }

        if (!fs.existsSync(metadataPath)) {
            await logActivity('clasificacion_fallida', 'Archivo de metadata no encontrado.', id_usuario_creador);
            return res.status(404).json({ error: 'Metadata no encontrada' });
        }

        // Ejecutar el script de Python para procesar el CSV de manera asíncrona
        const pythonPreProcess = spawn('python', [
            'scripts/preprosesamiento.py',
            archivo
        ]);
    
        let stdoutData = '';
        let stderrData = '';
    
        pythonPreProcess.stdout.on('data', (data) => {
            stdoutData += data.toString();
        });
    
        pythonPreProcess.stderr.on('data', (data) => {
            stderrData += data.toString();
            console.error(`Error en Python: ${data}`);
        });

        pythonPreProcess.on('close', async (code) => {
            try {
            console.log(`Script Python terminó con código: ${code}`);
            
            if (code !== 0 || stderrData.includes('ERROR') || stdoutData.includes('ERROR')) {
                await logActivity('clasificacion_fallida', `Error en preprocesamiento CSV: ${stderrData || stdoutData}`, id_usuario_creador);
                console.error('Error en el procesamiento:', stderrData || stdoutData);
                return;
            }
    
            const metadata_processedFilePath = stdoutData.trim();
            console.log(`csv: ${metadata_processedFilePath}-modelo:${modelo_path}-Metaata:${metadataPath}`);
            
            // Ejecutar script de Python para clasificar
            const pythonProcess = spawn('python', [
                'scripts/clasificar.py',
                modelo_path,
                metadataPath,
                metadata_processedFilePath
            ]);

            let salida = '';
            let error = '';

            pythonProcess.stderr.on('data', (data) => {
                error += data.toString();
                console.error('Error en Python:', data.toString()); // Agregar más detalles
            });
            
            pythonProcess.stdout.on('data', (data) => {
                salida += data.toString();
                console.log('Salida Python:', data.toString()); // Ver más detalles de la salida
            });     

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    logActivity('clasificacion_fallida', `Fallo al ejecutar clasificar.py: ${error}`, id_usuario_creador);
                    console.error('Error al ejecutar el script:', error);
                    return res.status(500).json({ error: 'Error al ejecutar la predicción', detalles: error });
                }

                try {
                    const resultado = JSON.parse(salida);
                    if (resultado.error) {
                        logActivity('clasificacion_fallida', resultado.error, id_usuario_creador);
                        return res.status(400).json({ error: resultado.error });
                    }

                    const archivoSalida = resultado.archivo_salida;

                    if (!fs.existsSync(archivoSalida)) {
                        logActivity('clasificacion_fallida', 'El archivo clasificado no fue generado', id_usuario_creador);
                        return res.status(500).json({ error: 'El archivo clasificado no fue generado' });
                    }

                    /*res.download(archivoSalida, (err) => {
                        if (err) {
                            console.error('Error al enviar archivo:', err);
                            return res.status(500).json({ error: 'No se pudo descargar el archivo clasificado' });
                        }

                        // Opcional: Eliminar CSV subido después de la descarga
                        //fs.unlink(ruta_archivo, () => {});
                    });*/
                    logActivity('clasificacion_exitosa', `Clasificación exitosa con modelo ${id_modelo_entrenado}. Archivo generado: ${archivoSalida}`, id_usuario_creador);
                    res.status(201).json({ message: 'Clasificacion completada.', resultado });
                } catch (err) {
                    logActivity('clasificacion_fallida', 'Error al interpretar salida de clasificar.py', id_usuario_creador);
                    console.error('Error al parsear la salida del script:', err);
                    return res.status(500).json({ error: 'Error procesando la salida del script' });
                }
            });

            } catch (error) {
                console.error('Error al finalizar el preprocesamiento:', error);
                await logActivity('clasificacion_error', `Fallo inesperado al cerrar preprocesamiento: ${error.message}`, id_usuario_creador);
            }
        });

    } catch (err) {
        console.error('Error en el endpoint /clasificar:', err);
        await logActivity('clasificacion_error', `Fallo general en /clasificar: ${err.message}`, req.body.id_usuario_creador);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post('/clasificar/formulario', async (req, res) => {
  try {
    const { id_modelo_entrenado, id_usuario_creador } = req.body;
    const datosFormulario = JSON.parse(req.body.datosFormulario || '{}');

    const resultado = await db.tb_resultados_entrenamiento.findByPk(id_modelo_entrenado);
    if (!resultado) return res.status(404).json({ error: 'Modelo no encontrado' });

    const dataset = await db.tb_datasets.findByPk(resultado.id_dataset);
    if (!dataset) return res.status(404).json({ error: 'Dataset no encontrado' });

    const metadataPath = dataset.archivo;
    if (!fs.existsSync(metadataPath)) return res.status(404).json({ error: 'Archivo de metadata no encontrado' });

    // Leer archivo metadata JSON
    const contenidoMetadata = fs.readFileSync(metadataPath, 'utf8');
    const metadataJSON = JSON.parse(contenidoMetadata);
    const rutaArchivoOriginal = metadataJSON.archivo_original;

    if (!fs.existsSync(rutaArchivoOriginal)) {
      return res.status(404).json({ error: 'No se encontró el archivo original para leer columnas' });
    }

    // Leer la primera fila del archivo CSV original para obtener las columnas reales
    const stream = fs.createReadStream(rutaArchivoOriginal);
    const rl = readline.createInterface({ input: stream });
    
    const columnas = await new Promise((resolve, reject) => {
    let primeraLinea = '';

    rl.on('line', (line) => {
        primeraLinea = line;
        rl.close(); // Solo la primera línea
        stream.destroy();

        // Probar delimitadores comunes
        const porComa = line.split(',').map(c => c.trim());
        const porPuntoComa = line.split(';').map(c => c.trim());

        const columnas = porPuntoComa.length > porComa.length ? porPuntoComa : porComa;
        resolve(columnas);
    });

    rl.on('error', reject);
    });

    // Construir objeto ordenado según las columnas reales
    const filaOrdenada = {};
    columnas.forEach(col => {
      filaOrdenada[col] = datosFormulario[col] ?? '';
    });

    // Convertir en CSV
    const csv = parse([filaOrdenada], { fields: columnas, delimiter: ';' });
    const nombreArchivoTemp = `temp_${Date.now()}.csv`;
    const rutaCsvTemp = path.join('FormularioCsvTem', nombreArchivoTemp);
    fs.writeFileSync(rutaCsvTemp, csv);

    // Ejecutar script Python
    const python = spawn('python', [
      'scripts/clasificar_formulario.py',
      resultado.modelo_entrenado,
      metadataPath,
      rutaCsvTemp
    ]);

    let salida = '';
    let error = '';

    python.stdout.on('data', data => salida += data.toString());
    python.stderr.on('data', data => error += data.toString());

    python.on('close', code => {
      fs.unlinkSync(rutaCsvTemp); // Limpieza del archivo temporal

      if (code !== 0) {
        return res.status(500).json({ error: 'Error al clasificar', detalles: error });
      }

      try {
        const resultadoFinal = JSON.parse(salida);
        if (resultadoFinal.error) {
          return res.status(400).json({ error: resultadoFinal.error });
        }
        return res.status(200).json({ message: 'Clasificación completada', resultado: resultadoFinal });
      } catch (e) {
        return res.status(500).json({ error: 'Error al procesar la respuesta del clasificador' });
      }
    });

  } catch (err) {
    console.error('Error en clasificación con formulario:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
