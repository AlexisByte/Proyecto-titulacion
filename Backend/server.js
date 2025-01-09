const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./models'); // Asegúrate de que el archivo de modelos está bien configurado
const passport = require('passport');


const recupera = require('./routes/password');
const authRoutes = require('./routes/auth');
const passportJWT = require('passport-jwt');
const { Strategy, ExtractJwt } = passportJWT;
const reciclajeRoutes = require('./routes/reciclajeRoutes');
const operaciones = require('./routes/operaciones');
const notificationRoutes = require('./routes/notificationRoutes'); // Importar rutas de notificaciones

//require('./config/passport')(passport);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'secret'
};

passport.use(new Strategy(jwtOptions, async (jwt_payload, done) => {
  try {
    // Aquí puedes agregar la lógica para buscar al usuario por su id
    // por ejemplo: const user = await User.findById(jwt_payload.id);
    return done(null, jwt_payload);
  } catch (error) {
    return done(error, false);
  }
}));

app.use(passport.initialize());

// Incluir rutas CRUD
app.use('/api', recupera);     //recuperacion de contraseña
app.use('/api/reciclaje', reciclajeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ message: 'Acceso a la Ruta protegida' });
});
app.use('/api/negocios', require('./routes/negocioRoutes'));
app.use('/api/ofertas', require('./routes/ofertaRoutes'));
app.use('/api/credenciales', require('./routes/credencialRoutes'));
app.use('/api/puntos_verdes', require('./routes/puntoVerdeRoutes'));
app.use('/api/admins', require('./routes/admins'));
app.use('/api/canjea_ofertas', require('./routes/canjeaOfertas'));
app.use('/api/ciudadanos', require('./routes/ciudadanos'));
app.use('/api/greecoins', require('./routes/greecoins'));
app.use('/api/historial', require('./routes/historiales'));
app.use('/api/historial_negocios', require('./routes/historialNegocios'));
app.use('/api/materiales', require('./routes/materiales'));
app.use('/api/reciclajes', require('./routes/reciclajes'));
app.use('/api/registro_reciclaje', require('./routes/registroReciclajeRoutes'));
// Ruta para las operaciones con GreenCoins
app.use('/api/ofertas_greencoins', operaciones);

app.use('/api/notificaciones', notificationRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});