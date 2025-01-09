const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const upload = require('../config/multer');
const { tb_credenciales} = require('../models');


// Verificar si el correo ya existe
const emailExists = async (correo_electronico) => {
    const existingUser = await tb_credenciales.findOne({ where: { correo_electronico } });
    return !!existingUser;
};

// Login
exports.login = async (req, res) => {
    try {
        const { correo_electronico, contrasena } = req.body;

        // Buscar credenciales
        const credencial = await tb_credenciales.findOne({ where: { correo_electronico } });
        if (!credencial) return res.status(404).json({ message: 'Usuario no encontrado' });

        // Comparar contraseñas
        const isMatch = await bcrypt.compare(contrasena, credencial.contrasena);
        if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

        // Generar token    
        const token = jwt.sign({ id: credencial.credencial_id, tipousuario: credencial.tipousuario }, 'secret', { expiresIn: '1h' });
        //const notificaciones = notificationService.getNotifications(user.credencial_id);

        // Obtener información adicional del usuario
        let userInfo;
        if (credencial.tipousuario === 1) {
            userInfo = await tb_ciudadano.findOne({ where: { ciudadano_id: credencial.usuario_id } });

            const gc = await tb_greencoin_cdn.findOne({
                where: { greencoin_id: userInfo.greencoin_id }
            });

            res.json({ token ,
                user: {
                    ciudadano_id: credencial.usuario_id,
                    correo_electronico: credencial.correo_electronico,
                    tipousuario: credencial.tipousuario,
                    nombre: userInfo.nombre,
                    apellido: userInfo.apellido,
                    telefono: userInfo.telefono,
                    fecha_nac: userInfo.fecha_nac,
                    estado: userInfo.estado,
                    greencoins: gc.total
                }
            });

        } else if (credencial.tipousuario === 2 && credencial.estado === true) {
            userInfo = await tb_negocio.findOne({ where: { negocio_id: credencial.usuario_id } });

            res.json({ token ,
                user: {
                    negocio_id: credencial.usuario_id,
                    correo_electronico: credencial.correo_electronico,
                    tipousuario: credencial.tipousuario,
                    image: userInfo.image,
                    estado: userInfo.estado
                }
            });

        } else if (credencial.tipousuario === 3 && credencial.estado === true) {
            userInfo = await tb_admin.findOne({ where: { admin_id: credencial.usuario_id } });

            res.json({ token ,
                user: {
                    admin_id: credencial.usuario_id,
                    nombre: userInfo.nombre,  // Asegurándote de incluir el nombre del admin
                    correo_electronico: credencial.correo_electronico,
                    tipousuario: credencial.tipousuario,
                    estado: userInfo.estado
                }
            });
        }
        else {
            // Si no se cumple ninguna de las condiciones
            return res.status(400).json({ message: 'Usuario no reconocido o no válido' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

