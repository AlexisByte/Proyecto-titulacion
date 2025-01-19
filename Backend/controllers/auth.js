const jwt = require('jsonwebtoken');
const SECRET_KEY = 't_clv_scrt_sgr'; // Asegúrate de usar la misma clave que en la generación del token

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(403).json({ message: 'Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1]; // Extraer el token del encabezado

  if (!token) {
    return res.status(403).json({ message: 'Formato de token inválido.' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY); // Verificar y decodificar el token
    req.usuario = decoded; // Añadir los datos del usuario al objeto req
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado.', error: error.message });
  }
};

module.exports = verificarToken;
