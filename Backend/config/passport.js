// config/passport.js
const { Strategy, ExtractJwt } = require('passport-jwt');
const { tb_credenciales } = require('../models');

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'secret'
};

module.exports = (passport) => {
    passport.use(new Strategy(options, async (payload, done) => {
        try {
            const credencial = await tb_credenciales.findByPk(payload.id);
            if (credencial) {
                return done(null, credencial);
            } else {
                return done(null, false);
            }
        } catch (error) {
            return done(error, false);
        }
    }));
};
