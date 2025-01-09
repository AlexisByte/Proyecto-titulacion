const { tb_greencoin_cdn, tb_historiales, tb_reciclaje, tb_ciudadano, tb_negocio, tb_puntos_verdes, tb_registra_reciclaje, tb_materiales, tb_credenciales } = require('../models');
const notificationService = require('../services/notificationService');

// Registrar reciclaje
exports.registrarReciclaje = async (req, res) => {
    try {
        const { correo_electronico, negocio_id, punto_verde_id, cantidad, material_id, descripcion } = req.body;
        let ciudadano_id = null;

        // Buscar el ciudadano en la tabla tb_credenciales
        try {
            const credencial = await tb_credenciales.findOne({
                where: { correo_electronico }
            });
    
            if (credencial) {
                ciudadano_id = credencial.usuario_id;
            } else {
                // Si no se encuentra, devolver un mensaje indicando que no se encontró
                return res.status(404).json({ message: 'Correo electrónico no encontrado' });
            }
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
        
        // Verificar si el ciudadano, negocio y punto verde existen
        const [ciudadan, negocio, puntov] = await Promise.all([
            tb_ciudadano.findByPk(ciudadano_id),
            tb_negocio.findByPk(negocio_id),
            tb_puntos_verdes.findByPk(punto_verde_id)
        ]);

        if (!ciudadan || !negocio || !puntov) {
            return res.status(404).json({ error: 'Ciudadano, negocio o punto verde no encontrado' });
        }

        // Obtener el valor_por_libra del material
        const material = await tb_materiales.findByPk(material_id);
        if (!material) {
            return res.status(404).json({ error: 'Material no encontrado' });
        }
        const valor_por_libra = material.valor_por_libra;


        // Crear el reciclaje
        const reciclaje = await tb_reciclaje.create({
            cantidad,
            material_id,
            descripcion
        });

        // Crear el registro de reciclaje
        const reg_reciclaje = await tb_registra_reciclaje.create({
            ciudadano_id,
            negocio_id,
            punto_verde_id,
            reciclaje_id: reciclaje.reciclaje_id,
            cantidad,
        });

         const gc_obtenidos = cantidad * valor_por_libra;

        // Crear los historiales
        await tb_historiales.create({
            ciudadano_id: reg_reciclaje.ciudadano_id,
            punto_verde_id: reg_reciclaje.punto_verde_id,
            reciclaje_id: reciclaje.reciclaje_id,
            cantidad: reciclaje.cantidad,
            negocio_id: reg_reciclaje.negocio_id,
            greencoins_obtenidos: gc_obtenidos
        });

        // Actualizar el estado de greencoins
        const greencoinRecord = await tb_greencoin_cdn.findOne({
            where: { greencoin_id: ciudadan.greencoin_id }
        });

        const newTotal = greencoinRecord.total + gc_obtenidos;
            await tb_greencoin_cdn.update(
                { total: newTotal, registro_id: reciclaje.reciclaje_id },
                { where: { greencoin_id: ciudadan.greencoin_id } }
            );

         // Agregar notificación al servicio de notificaciones
         const notificacionMensaje = {
            titulo: 'Registro de reciclaje exitoso',
            mensaje: `Has registrado un reciclaje exitosamente en el punto verde: ${negocio.nombre}. Material: ${material.nombre}, Cantidad: ${cantidad} libras, GreenCoins obtenidos: ${gc_obtenidos}`
        };
        notificationService.addNotification(ciudadano_id, notificacionMensaje);

        res.status(201).json({ message: 'Reciclaje registrado exitosamente', reciclaje });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener historial de reciclaje para un ciudadano
exports.obtenerHistorialCiudadano = async (req, res) => {
    try {
        const { ciudadano_id } = req.params;

        const historial = await tb_historiales.findAll({
            where: { ciudadano_id },
            attributes: ['fecha', 'greencoins_obtenidos'],
            include: [
                { model: tb_puntos_verdes, attributes: ['direccion']},
                { model: tb_negocio, attributes: ['nombre', 'propietario', 'telefono']},
                { model: tb_ciudadano, attributes: ['nombre', 'telefono']}
            ]
        });

        res.json(historial);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener historial de reciclaje para un negocio
exports.obtenerHistorialNegocio = async (req, res) => {
    try {
        const { negocio_id } = req.params;

        const historial = await tb_historiales.findAll({
            where: { negocio_id },
            attributes: ['fecha', 'greencoins_obtenidos'],
            include: [
                { model: tb_puntos_verdes, attributes: ['direccion']},
                { model: tb_negocio, attributes: ['nombre', 'propietario', 'telefono']},
                { model: tb_ciudadano, attributes: ['nombre', 'telefono']}
            ]
        });

        res.json(historial);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
