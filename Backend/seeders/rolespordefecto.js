'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Insertar roles predeterminados
    await queryInterface.bulkInsert('tb_roles', [
      {
        id_rol: 1,
        nombre_rol: 'Administrador',
        descripcion: 'Usuario con acceso completo al sistema.',
        fecha_creacion: new Date()
      },
      {
        id_rol: 2,
        nombre_rol: 'Gerente',
        descripcion: 'Usuario con acceso para gestionar ajustes y configuraciones financieras.',
        fecha_creacion: new Date()
      },
      {
        id_rol: 3,
        nombre_rol: 'Ventanilla',
        descripcion: 'Usuario con acceso para realizar consultas de solvencia y operaciones básicas.',
        fecha_creacion: new Date()
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar todos los roles
    await queryInterface.bulkDelete('tb_roles', null, {});
  }
};
