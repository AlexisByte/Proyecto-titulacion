const os = require('os');
const fs = require('fs');
const path = require('path');

module.exports = function getPythonExecutable() {
  const platform = os.platform();

  const posiblesRutas = [];

  if (platform === 'win32') {
    posiblesRutas.push(
      path.join(__dirname, '..', 'venv', 'Scripts', 'python.exe'),
      'python',
      'python3'
    );
  } else {
    posiblesRutas.push(
      path.join(__dirname, '..', 'venv', 'bin', 'python'),
      '/usr/bin/python3',
      '/usr/bin/python',
      'python3',
      'python'
    );
  }

  for (const ruta of posiblesRutas) {
    if (ruta === 'python' || ruta === 'python3') return ruta;
    if (fs.existsSync(ruta)) return ruta;
  }

  throw new Error('No se pudo detectar un ejecutable de Python válido.');
};
