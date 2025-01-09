module.exports = (sequelize, DataTypes) => {
    const Historiales = sequelize.define('tb_historiales', {
      historial_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      ciudadano_id: DataTypes.INTEGER,
      punto_verde_id: DataTypes.INTEGER,
      reciclaje_id: DataTypes.INTEGER,
      negocio_id: DataTypes.INTEGER,
      cantidad: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      greencoins_obtenidos: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }, {
      tableName: 'tb_historiales',
      timestamps: false
    });
  
    Historiales.associate = function(models) {
      Historiales.belongsTo(models.tb_ciudadano, { foreignKey: 'ciudadano_id' });
      Historiales.belongsTo(models.tb_puntos_verdes, { foreignKey: 'punto_verde_id' });
      Historiales.belongsTo(models.tb_reciclaje, { foreignKey: 'reciclaje_id' });
      Historiales.belongsTo(models.tb_negocio, { foreignKey: 'negocio_id' });
    };
  
    return Historiales;
  };
  