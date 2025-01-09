// notificationController.js
const notificationService = require('../services/notificationService');

// Obtener notificaciones para un ciudadano
exports.obtenerNotificaciones = async (req, res) => {
    try {
        const { ciudadano_id } = req.params;
        const notificaciones = notificationService.getNotifications(ciudadano_id);
        res.json(notificaciones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Marcar notificaciones como leídas
exports.marcarNotificacionesLeidas = async (req, res) => {
    try {
        const { ciudadano_id } = req.params;
        notificationService.clearNotifications(ciudadano_id);
        res.json({ message: 'Notificaciones marcadas como leídas' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
