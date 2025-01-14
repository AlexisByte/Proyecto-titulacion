'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  down: async (queryInterface, Sequelize) => {
    // Eliminar el administrador y su rol asociado
    await queryInterface.bulkDelete('tb_usuarios_roles', null, {});
    await queryInterface.bulkDelete('tb_usuarios', { email: 'admin@titulacion.com' });
  },
  up: async (queryInterface, Sequelize) => {
    // Datos del administrador por defecto
    const nombre = 'Admin Default';
    const correo_electronico = 'admin@titulacion.com';
    const contrasena = 'Titulacion2025'; // Cambia esto a una contraseña segura
    const activo = true;
    const rol = 1;

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Insertar el usuario en tb_usuarios
    const [usuario] = await queryInterface.bulkInsert('tb_usuarios', [
      {
        nombre,
        email: correo_electronico,
        contrasena: hashedPassword,
        activo,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    // Asignar el rol de Administrador al usuario creado en tb_usuarios_roles
    await queryInterface.bulkInsert('tb_usuarios_roles', [
      {
        id_usuario: usuario.id_usuario,
        id_rol: rol, // Rol de Administrador
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  }

  
};
