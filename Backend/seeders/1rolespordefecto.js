'use strict';

module.exports = {
  down: async (queryInterface, Sequelize) => {
    // Eliminar todos los roles
    await queryInterface.bulkDelete('tb_roles', null, {});
  },
  up: async (queryInterface, Sequelize) => {
    // Insertar roles predeterminados
    await queryInterface.bulkInsert('tb_roles', [
      {
        nombre_rol: 'Administrador',
        descripcion: 'Usuario con acceso completo al sistema.',
        createdAt: new Date(),  // Agregar valor para createdAt
        updatedAt: new Date()   // Agregar valor para updatedAt
      },
      {
        nombre_rol: 'Gerente',
        descripcion: 'Usuario con acceso para gestionar ajustes y configuraciones financieras.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre_rol: 'Ventanilla',
        descripcion: 'Usuario con acceso para realizar consultas de solvencia y operaciones básicas.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ]);
  }
};
