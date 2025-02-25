const express = require('express');
const router = express.Router();
const db = require('../models');
const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs');

router.post('/entrenamiento', async (req, res) => {
    let { id_version, id_dataset, k_features } = req.body;

    // Convertir k_features a número (por si llega como string)
    k_features = parseInt(k_features);

    // Validar que k_features sea un número entero positivo
    if (!Number.isInteger(k_features) || k_features <= 2) {
        return res.status(400).json({ message: 'Debe ser un número entero positivo mayor a 2.' });
    }

    try {
        // Verificar existencia de los registros
        const version = await db.tb_versiones_modelos.findByPk(id_version);
        const dataset = await db.tb_datasets.findByPk(id_dataset);
        if (!version) return res.status(404).json({ message: 'La versión del modelo no existe.' });
        if (!dataset) return res.status(404).json({ message: 'El dataset no existe.' });

        // Obtener rutas del modelo y dataset
        let modeloRuta, datasetRuta;
        try {
            const modeloRutaResponse = await axios.get(`http://localhost:3000/api/modelosIA/ruta/${id_version}`, {
                headers: { Authorization: req.headers.authorization } // Reenvía el token recibido
            });
            modeloRuta = modeloRutaResponse.data.ruta;
            if (!modeloRuta) throw new Error('Ruta del modelo no encontrada.');
        } catch (error) {
            return res.status(500).json({ message: 'Error obteniendo la ruta del modelo.', error: error.message });
        }

        try {
            const datasetRutaResponse = await axios.get(`http://localhost:3000/api/datasets/ruta/${id_dataset}`, {
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
        const pythonProcess = spawn('python', [modeloRuta, datasetRuta, String(k_features)]);

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

                if (!resultados.fp || !resultados.fn || !resultados.precision || !resultados.exactitud || !resultados.recall) {
                    return res.status(500).json({ message: 'Resultados del entrenamiento inválidos.' });
                }

                // Guardar en la base de datos
                const nuevoResultado = await db.tb_resultados_entrenamiento.create({
                    id_version,
                    id_dataset,
                    fp: resultados.fp,
                    fn: resultados.fn,
                    precision: resultados.precision,
                    exactitud: resultados.exactitud,
                    recall: resultados.recall,
                    fecha_entrenamiento: new Date(),
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

module.exports = router;
