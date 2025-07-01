const env = process.env.NODE_ENV || 'production';
const config = require(__dirname + '/config/config.json')[env];
const Sequelize = require('sequelize');

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const db = require('./models');

(async () => {
  try {
    await db.sequelize.sync({ force: true });
    console.log("Database & tables created!");
  } catch (error) {
    console.error("Error during database sync:", error);
  } finally {
    process.exit();
  }
})();
