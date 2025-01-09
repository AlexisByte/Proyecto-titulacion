module.exports = (sequelize, DataTypes) => {
    const RegistraReciclaje = sequelize.define('tb_registra_reciclaje', {
      registro_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      punto_verde_id: DataTypes.INTEGER,
      reciclaje_id: DataTypes.INTEGER,
      ciudadano_id: DataTypes.INTEGER,
      negocio_id: DataTypes.INTEGER,
      cantidad: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'tb_registra_reciclaje',
      timestamps: false
    });
  
    RegistraReciclaje.associate = function(models) {
      RegistraReciclaje.belongsTo(models.tb_puntos_verdes, { foreignKey: 'punto_verde_id' });
      RegistraReciclaje.belongsTo(models.tb_reciclaje, { foreignKey: 'reciclaje_id' });
      RegistraReciclaje.belongsTo(models.tb_ciudadano, { foreignKey: 'ciudadano_id' });
      RegistraReciclaje.belongsTo(models.tb_negocio, { foreignKey: 'negocio_id' });
    };
  
    return RegistraReciclaje;
  };
  