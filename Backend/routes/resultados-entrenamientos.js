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
const readline = require('readline'); 
const { parse } = require('json2csv');

// const pythonExecutable = '/root/Proyecto-titulacion/Backend/venv/bin/python'; //linux
const pythonExecutable = path.join(__dirname, '..', 'venv', 'Scripts', 'python.exe'); //windows


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
  const {
    id_version,
    id_dataset,
    id_equifax_dataset,
    skip_columns,
    test_size,
    random_state,
    alpha
  } = req.body;

  const id_usuario = req.usuario.id_usuario;

  try {
    // 1️⃣ Obtener versión del modelo
    const version = await db.tb_versiones_modelos.findByPk(id_version);

    if (!version) {
      return res.status(404).json({ message: 'La versión del modelo no existe.' });
    }

    // ============================================================
    // 🧠 ENTRENAMIENTO DE CLASIFICACIÓN
    // ============================================================
    if (version.tipo_modelo === 'clasificacion') {

      if (!id_dataset) {
        return res.status(400).json({
          message: 'Debe enviar id_dataset para modelos de clasificación.'
        });
      }

      const dataset = await db.tb_datasets.findByPk(id_dataset);
      if (!dataset) {
        return res.status(404).json({ message: 'Dataset no encontrado.' });
      }

      // evitar duplicados
      const existe = await db.tb_resultados_entrenamiento.findOne({
        where: { id_version, id_dataset }
      });

      if (existe) {
        return res.status(409).json({
          message: 'Ya existe un entrenamiento para esta versión y dataset.',
          existente: existe
        });
      }

      const metadataPath = dataset.archivo;
      const metadata = JSON.parse(await fsPromises.readFile(metadataPath, 'utf8'))[0];
      const datasetRuta = metadata.archivo_procesado;

      const python = spawn(pythonExecutable, [
        'scripts/entrenar_ia.py',
        datasetRuta,
        version.contenido,
        String(skip_columns || 0),
        String(test_size || 0.2),
        String(random_state || 42),
        metadataPath
      ]);

      let salida = '';
      let error = '';

      python.stdout.on('data', d => salida += d.toString());
      python.stderr.on('data', d => error += d.toString());

      python.on('close', async (code) => {
        if (code !== 0) {
          await logActivity('entrenamiento_fallido', error, id_usuario);
          return res.status(500).json({ message: 'Error entrenando modelo.', error });
        }

        const resultados = JSON.parse(salida.trim());

        const entrenamiento = await db.tb_resultados_entrenamiento.create({
          id_version,
          id_dataset,
          id_equifax_dataset: null,
          matriz_confusion: {
            etiquetas: resultados.clases,
            matriz: resultados.matriz_confusion
          },
          precision: resultados.precision,
          exactitud: resultados.exactitud,
          recall: resultados.recall,
          f1_score: resultados.f1_score,
          modelo_entrenado: resultados.path
        });

        await logActivity(
          'entrenamiento_exitoso',
          `Clasificación entrenada (dataset ${id_dataset})`,
          id_usuario
        );

        res.status(201).json({ message: 'Entrenamiento completado.', entrenamiento });
      });

      return;
    }

    // ============================================================
    // 📊 ENTRENAMIENTO SCORE EQUIFAX
    // ============================================================
    if (version.tipo_modelo === 'score') {

      if (!id_equifax_dataset) {
        return res.status(400).json({
          message: 'Debe enviar id_equifax_dataset para modelos score.'
        });
      }

      const dataset = await db.tb_equifax_datasets.findByPk(id_equifax_dataset);
      if (!dataset) {
        return res.status(404).json({ message: 'Dataset Equifax no encontrado.' });
      }

      // evitar duplicados
      const existe = await db.tb_resultados_entrenamiento.findOne({
        where: { id_version, id_equifax_dataset }
      });

      if (existe) {
        return res.status(409).json({
          message: 'Ya existe un entrenamiento score para esta versión y dataset.',
          existente: existe
        });
      }

      const python = spawn(pythonExecutable, [
        'scripts/entrenar_ia_score_equifax.py',
        dataset.archivo_csv,
        String(skip_columns || 0),
        String(alpha || 0.7)
      ]);

      let salida = '';
      let error = '';

      python.stdout.on('data', d => salida += d.toString());
      python.stderr.on('data', d => error += d.toString());

      python.on('close', async (code) => {
        if (code !== 0) {
          await logActivity('entrenamiento_score_fallido', error, id_usuario);
          return res.status(500).json({ message: 'Error entrenando score.', error });
        }

        const parsed = JSON.parse(salida.trim());
        const resultado = parsed.resultado || parsed;

        const entrenamiento = await db.tb_resultados_entrenamiento.create({
          id_version,
          id_dataset: null,
          id_equifax_dataset,
          modelo_entrenado: resultado.modelo_entrenado,
          precision: null,
          exactitud: null,
          recall: null,
          f1_score: null,
          matriz_confusion: null
        });

        await logActivity(
          'entrenamiento_score_exitoso',
          `Score Equifax entrenado (dataset ${id_equifax_dataset})`,
          id_usuario
        );

        res.status(201).json({
          message: 'Entrenamiento score Equifax completado.',
          entrenamiento,
          resultado
        });
      });

      return;
    }

    return res.status(400).json({
      message: 'Tipo de modelo no soportado.'
    });

  } catch (error) {
    await logActivity('entrenamiento_error_general', error.message, id_usuario);
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
        const pythonPreProcess = spawn(pythonExecutable, [
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
            const pythonProcess = spawn(pythonExecutable, [
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
                    if (resultado.filas_clasificadas <= 20 && resultado.archivo_pdf) {
                        return res.download(
                            resultado.archivo_pdf,
                            'informe_clasificacion.pdf'
                        );
                    }
                    if (resultado.error) {
                        logActivity('clasificacion_fallida', resultado.error, id_usuario_creador);
                        return res.status(400).json({ error: resultado.error });
                    }

                    const archivoSalida = resultado.archivo_salida;
                    db.tb_resultados_clasificacion.create({
                      id_resultado_entrenamiento: id_modelo_entrenado,
                      id_usuario: id_usuario_creador,
                      tipo_clasificacion: 'CSV',
                      resumen_resultado: {
                        ...resultado.resumen,
                        filas_clasificadas: resultado.filas_clasificadas,
                        tiempo_segundos: resultado.tiempo_procesamiento_seg
                      },
                      archivo_csv_resultado: archivoSalida
                    });

                    if (!fs.existsSync(archivoSalida)) {
                        logActivity('clasificacion_fallida', 'El archivo clasificado no fue generado', id_usuario_creador);
                        return res.status(500).json({ error: 'El archivo clasificado no fue generado' });
                        fs.unlink(archivo, () => {});
                    }

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
    const { id_modelo_entrenado, id_usuario_creador, datosFormulario } = req.body;
    console.log(' Body recibido:', req.body);
    
    if (!id_modelo_entrenado || !id_usuario_creador || !datosFormulario) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Si `datosFormulario` ya es un objeto (no un string), no necesitas parsear.
    const datosParsed = typeof datosFormulario === 'string' 
      ? JSON.parse(datosFormulario) 
      : datosFormulario;

    const resultado = await db.tb_resultados_entrenamiento.findByPk(id_modelo_entrenado);
    if (!resultado) {
      await logActivity('clasificacion_fallida', `Modelo no encontrado con ID ${id_modelo_entrenado}`, id_usuario_creador);
      return res.status(404).json({ error: 'Modelo no encontrado' });
    }

    const dataset = await db.tb_datasets.findByPk(resultado.id_dataset);
    if (!dataset) {
      await logActivity('clasificacion_fallida', `Dataset no encontrado para modelo ${id_modelo_entrenado}`, id_usuario_creador);
      return res.status(404).json({ error: 'Dataset no encontrado' });
    }

    const metadataPath = dataset.archivo;
    if (!fs.existsSync(metadataPath)) {
      await logActivity('clasificacion_fallida', `Metadata no encontrada en ${metadataPath}`, id_usuario_creador);
      return res.status(404).json({ error: 'Archivo de metadata no encontrado' });
    }

    // Leer archivo metadata JSON
    const contenidoMetadata = fs.readFileSync(metadataPath, 'utf8');
    const metadataJSON = JSON.parse(contenidoMetadata);
    const rutaArchivoOriginal = metadataJSON[0].archivo_original;

    if (!fs.existsSync(rutaArchivoOriginal)) {
      await logActivity('clasificacion_fallida', `Archivo original no encontrado en ${rutaArchivoOriginal}`, id_usuario_creador);
      return res.status(404).json({ error: 'No se encontró el archivo original para leer columnas' });
    }

    // Leer la primera línea del CSV para obtener columnas
    const stream = fs.createReadStream(rutaArchivoOriginal);
    const rl = readline.createInterface({ input: stream });

    const columnas = await new Promise((resolve, reject) => {
      let primeraLinea = '';

      rl.on('line', (line) => {
        primeraLinea = line;
        rl.close();
        stream.destroy();

        const porComa = line.split(',').map(c => c.trim());
        const porPuntoComa = line.split(';').map(c => c.trim());
        const columnas = porPuntoComa.length > porComa.length ? porPuntoComa : porComa;
        const delimitador = porPuntoComa.length > porComa.length ? ';' : ',';

        resolve({ columnas, delimitador });
      });

      rl.on('error', reject);
    });

    const { columnas: cols, delimitador } = columnas;

    let filaOrdenada = {};
    cols.forEach(col => {
      filaOrdenada[col] = datosParsed[col] ?? '';
    });

    const csv = parse([filaOrdenada], { fields: cols, delimiter: delimitador });

    const nombreArchivoTemp = `temp_${Date.now()}.csv`;
    const rutaCsvTemp = path.join('FormularioCsvTem', nombreArchivoTemp);

    // Asegurar que la carpeta existe
    if (!fs.existsSync('FormularioCsvTem')) {
      fs.mkdirSync('FormularioCsvTem');
    }

    fs.writeFileSync(rutaCsvTemp, csv);

    await logActivity('clasificacion_inicio', `Clasificación desde formulario iniciada para modelo ${id_modelo_entrenado}`, id_usuario_creador);

    const python = spawn(pythonExecutable, [
      'scripts/clasificar_formulario.py',
      resultado.modelo_entrenado,
      metadataPath,
      rutaCsvTemp
    ]);


    let salida = '';
    let error = '';

    python.stdout.on('data', data => salida += data.toString());
    python.stderr.on('data', data => error += data.toString());

    python.on('close', async (code) => {
      fs.unlinkSync(rutaCsvTemp); // Eliminar archivo temporal

      if (code !== 0) {
        await logActivity('clasificacion_fallida', `Error en script Python: ${error}`, id_usuario_creador);
        return res.status(500).json({ error: 'Error al clasificar', detalles: error });
      }

      try {
        const resultadoFinal = JSON.parse(salida);

        await db.tb_resultados_clasificacion.create({
          id_resultado_entrenamiento: id_modelo_entrenado,
          id_usuario: id_usuario_creador,
          tipo_clasificacion: 'FORMULARIO',
          resumen_resultado: {
            prediccion: resultadoFinal.prediccion,
            columna_objetivo: resultadoFinal.columna_objetivo
          },
          archivo_csv_resultado: null
        });

        if (resultadoFinal.error) {
          await logActivity('clasificacion_fallida', resultadoFinal.error, id_usuario_creador);
          return res.status(400).json({ error: resultadoFinal.error });
        }

        await logActivity('clasificacion_exitosa', `Clasificación exitosa desde formulario con modelo ${id_modelo_entrenado}`, id_usuario_creador);
        return res.status(200).json({ message: 'Clasificación completada', resultado: resultadoFinal });

      } catch (e) {
        await logActivity('clasificacion_fallida', 'Error al parsear salida de clasificador', id_usuario_creador);
        return res.status(500).json({ error: 'Error al procesar la respuesta del clasificador' });
      }
    });

  } catch (err) {
    console.error('Error en clasificación con formulario:', err);
    await logActivity('clasificacion_error', `Error general en clasificación desde formulario: ${err.message}`, req.body.id_usuario_creador);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
