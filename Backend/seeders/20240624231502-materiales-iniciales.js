
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('tb_materiales', [
      {
        tipo: 'Papel y Cartón',
        valor_por_libra: 10,
        fechacreacion: new Date()
      },
      {
        tipo: 'Vidrio',
        valor_por_libra: 5,
        fechacreacion: new Date()
      },
      {
        tipo: 'Textiles',
        valor_por_libra: 15,
        fechacreacion: new Date()
      },
      {
        tipo: 'Madera',
        valor_por_libra: 10,
        fechacreacion: new Date()
      },
      {
        tipo: 'Plásticos',
        valor_por_libra: 15,
        fechacreacion: new Date()
      },
      {
        tipo: 'Metales',
        valor_por_libra: 25,
        fechacreacion: new Date()
      },
      {
        tipo: 'Orgánicos',
        valor_por_libra: 2,
        fechacreacion: new Date()
      }
    ], {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('tb_materiales', null, {});
  }
};
