const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./models');
const passport = require('passport');
const path = require('path');

const passportJWT = require('passport-jwt');
const { Strategy, ExtractJwt } = passportJWT;

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware CORS debe ir primero
app.use(cors({
  origin: ['https://tufinanciera.app', 'https://www.tufinanciera.app','http://localhost:4200'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Opcional para manejar preflight
app.options('*', cors());

app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

app.use('/clasificados', express.static(path.join(__dirname, 'clasificados')));

// JWT config
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'secret'
};

passport.use(new Strategy(jwtOptions, async (jwt_payload, done) => {
  try {
    return done(null, jwt_payload);
  } catch (error) {
    return done(error, false);
  }
}));

const verificarToken = require('./controllers/auth');

// Rutas
app.use('/api/login', require('./routes/login'));
app.use('/api/users', verificarToken, require('./routes/users'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/users-roles', verificarToken, require('./routes/users_roles'));
app.use('/api/reglas-negocio', verificarToken, require('./routes/reglas_negocios'));
app.use('/api/modelosIA', verificarToken,  require('./routes/modelos'));
app.use('/api/reportes', verificarToken, require('./routes/reportes'));
app.use('/api/evaluaciones', verificarToken, require('./routes/evaluaciones'));
app.use('/api/datasets', verificarToken, require('./routes/datasets'));
app.use('/api/resultados-entrenamiento', verificarToken, require('./routes/resultados-entrenamientos'));
app.use('/api/logs',verificarToken, require('./routes/actividades')); 
app.use('/api/equifax',verificarToken, require('./routes/equifax')); 
app.use('/api', verificarToken, require('./routes/password'));
require('./utils/limpiarArchivosTemporales')();

// Arranque del servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
});

/*
// Aumentar el tiempo de espera del servidor
server.timeout = 600000; 
server.keepAliveTimeout = 600000;
server.headersTimeout = 601000; // Debe ser ligeramente superior al keepAlive
*/