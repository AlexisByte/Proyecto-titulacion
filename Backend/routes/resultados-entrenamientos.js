const express = require('express');
const router = express.Router();
const db = require('../models');
const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs');

router.post('/entrenamiento', async (req, res) => {
    let { id_version, id_dataset, skip_columns } = req.body;

    try {
        // Verificar existencia de los registros
        const version = await db.tb_versiones_modelos.findByPk(id_version);
        const dataset = await db.tb_datasets.findByPk(id_dataset);
        if (!version) return res.status(404).json({ message: 'La versión del modelo no existe.' });
        if (!dataset) return res.status(404).json({ message: 'El dataset no existe.' });

        // Obtener rutas del modelo y dataset
        let modeloRuta, datasetRuta;
        try {
            const modeloRutaResponse = await axios.get(`http://localhost:5000/api/modelosIA/ruta/${id_version}`, {
                headers: { Authorization: req.headers.authorization } // Reenvía el token recibido
            });
            modeloRuta = modeloRutaResponse.data.ruta;
            if (!modeloRuta) throw new Error('Ruta del modelo no encontrada.');
        } catch (error) {
            return res.status(500).json({ message: 'Error obteniendo la ruta del modelo.', error: error.message });
        }

        try {
            const datasetRutaResponse = await axios.get(`http://localhost:5000/api/datasets/ruta/${id_dataset}`, {
                headers: { Authorization: req.headers.authorization } // Pasar el token también aquí
            });
            datasetRuta = datasetRutaResponse.data.ruta;
            if (!datasetRuta) throw new Error('Ruta del dataset no encontrada.');
        } catch (error) {
            return res.status(500).json({ message: 'Error obteniendo la ruta del dataset.', error: error.message });
        }

        // Verificar existencia de archivos en el sistema
        if (!fs.existsSync(modeloRuta)) return res.status(400).json({ message: 'El archivo del modelo no existe en la ruta especificada.' });
        if (!fs.existsSync(datasetRuta)) return res.status(400).json({ message: 'El archivo del dataset no existe en la ruta especificada.' });

        // Ejecutar script de Python
        const pythonProcess = spawn('python', [modeloRuta, datasetRuta, String(skip_columns)]);

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
                console.error(`Error en el script de Python: ${errorPython}`);
                return res.status(500).json({ message: 'Error en el entrenamiento del modelo.', error: errorPython });
            }

            try {
                const resultados = JSON.parse(resultadoPython.trim());
                console.log("Resultados: "+resultados)
                if (!resultados.matriz_confusion || !resultados.precision || !resultados.exactitud || !resultados.recall) {
                    return res.status(500).json({ message: 'Resultados del entrenamiento inválidos.' });
                }

                // Guardar en la base de datos
                const nuevoResultado = await db.tb_resultados_entrenamiento.create({
                    id_version,
                    id_dataset,
                    matriz_confusion: resultados.matriz_confusion,
                    precision: resultados.precision,
                    exactitud: resultados.exactitud,
                    recall: resultados.recall,
                    f1_score: resultados.f1_score
                });

                res.status(201).json({ message: 'Entrenamiento completado.', resultado: nuevoResultado });
            } catch (error) {
                console.error('Error procesando resultados:', error);
                res.status(500).json({ message: 'Error procesando resultados del entrenamiento.' });
            }
        });

    } catch (error) {
        console.error('Error en el entrenamiento:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// Obtener todos los resultados de entrenamiento
router.get('/', async (req, res) => {
    try {
        const resultados = await db.tb_resultados_entrenamiento.findAll();
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
    try {
        const resultado = await db.tb_resultados_entrenamiento.findByPk(id);
        if (resultado) {
            await resultado.destroy();
            return res.status(200).json({ message: `Resultado con ID: ${id} eliminado correctamente.` });
        } else {
            return res.status(404).json({ message: `No se encontró el resultado con ID: ${id}` });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar el resultado', error: error.message });
    }
});

module.exports = router;
