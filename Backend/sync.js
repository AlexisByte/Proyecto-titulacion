const env = process.env.NODE_ENV || 'production';
const config = require(__dirname + '/config/config.json')[env];
const Sequelize = require('sequelize');

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const db = require('./models');

(async () => {
  try {
    if (env === 'development') {
      await db.sequelize.sync({ alter: true }); // Eliminar y crear tablas en desarrollo 
    } else {
      await db.sequelize.sync(); // Solo crea tablas que no existan en producción, no elimina datos
    }
    console.log("Database & tables created!");
  } catch (error) {
    console.error("Error during database sync:", error);
  } finally {
    process.exit();
  }
})();
