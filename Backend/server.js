const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./models'); // Asegúrate de que el archivo de modelos está bien configurado
const passport = require('passport');


const recupera = require('./routes/password');
const authRoutes = require('./routes/auth');
const passportJWT = require('passport-jwt');
const { Strategy, ExtractJwt } = passportJWT;

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
app.use('/api/auth', authRoutes);
app.use('/api/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ message: 'Acceso a la Ruta protegida' });
});
app.use('/api/users', require('./routes/users'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/users-roles', require('./routes/users_roles'));
app.use('/api/reglas', require('./routes/reglas_negocios'));
app.use('/api/modelosIA', require('./routes/modelos'));


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});