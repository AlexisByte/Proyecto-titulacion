module.exports = (sequelize, DataTypes) => {
    const GreencoinCdn = sequelize.define('tb_greencoin_cdn', {
      greencoin_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      registro_id: DataTypes.INTEGER,
      canjeo_id: DataTypes.INTEGER,
      total: DataTypes.INTEGER
    }, {
      tableName: 'tb_greencoin_cdn',
      timestamps: false
    });
  
    GreencoinCdn.associate = function(models) {
      GreencoinCdn.belongsTo(models.tb_registra_reciclaje, { foreignKey: 'registro_id' });
      GreencoinCdn.belongsTo(models.tb_canjea_oferta, { foreignKey: 'canjeo_id' });
    };
  
    return GreencoinCdn;
  };
  