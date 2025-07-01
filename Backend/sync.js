const db = require('./models');

(async () => {
  try {
    await db.sequelize.sync({ force: true }); // Cambiar a `true` si quieres forzar la recreación
    console.log("Database & tables created!");
  } catch (error) {
    console.error("Error during database sync:", error);
  } finally {
    process.exit(); // Cerrar el proceso después de la sincronización
  }
})();
