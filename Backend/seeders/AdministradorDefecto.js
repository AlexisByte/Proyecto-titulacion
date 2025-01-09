'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Datos del administrador por defecto
    const nombre = 'Admin Default';
    const correo_electronico = 'admin@greenpoint.com';
    const contrasena = 'Dmngrnpnt2024'; // Asegúrate de cambiar esto a una contraseña segura

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Insertar el administrador en tb_admin
    const [admin] = await queryInterface.bulkInsert('tb_admin', [{
      nombre,
      fechacreacion: new Date()
    }], { returning: true });

    // Insertar las credenciales en tb_credenciales
    await queryInterface.bulkInsert('tb_credenciales', [{
      correo_electronico,
      contrasena: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
      tipousuario: 3, // 3 para admin
      usuario_id: admin.admin_id,
      fechacreacion: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar el administrador y las credenciales asociadas
    await queryInterface.bulkDelete('tb_credenciales', {
      correo_electronico: 'admin@example.com'
    });

    await queryInterface.bulkDelete('tb_admin', {
      nombre: 'Admin Default'
    });
  }
};
