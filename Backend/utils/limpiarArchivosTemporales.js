// utils/limpiarArchivosTemporales.js
const fs = require('fs');
const path = require('path');

const DIRECTORIOS = [
  path.join(__dirname, '..', 'archivos_temporales'),
  path.join(__dirname, '..', 'uploads', '__pycache__')
];

const MILISEGUNDOS_H = 168 * 60 * 60 * 1000;

function borrarArchivosAntiguos(directorio) {
  fs.readdir(directorio, (err, archivos) => {
    if (err) return;

    archivos.forEach((archivo) => {
      const ruta = path.join(directorio, archivo);
      fs.stat(ruta, (err, stats) => {
        if (err) return;

        const ahora = Date.now();
        const ultimaModificacion = new Date(stats.mtime).getTime();

        if (ahora - ultimaModificacion > MILISEGUNDOS_H) {
          fs.unlink(ruta, (err) => {
            if (!err) console.log(`🗑️ Eliminado: ${ruta}`);
          });
        }
      });
    });
  });
}

function limpiarArchivosTemporales() {
  DIRECTORIOS.forEach(borrarArchivosAntiguos);
}

module.exports = () => {
  limpiarArchivosTemporales(); // ejecutar al iniciar el backend
  setInterval(limpiarArchivosTemporales, 24 * 60 * 60 * 1000); // repetir cada 24 horas
};
