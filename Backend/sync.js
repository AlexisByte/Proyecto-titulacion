// sync.js
const db = require('./models');

db.sequelize.sync({ force: true }).then(() => {
  console.log("Database & tables created!");
});
