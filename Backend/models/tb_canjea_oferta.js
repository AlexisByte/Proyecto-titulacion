module.exports = (sequelize, DataTypes) => {
    const CanjeaOferta = sequelize.define('tb_canjea_oferta', {
      canjeo_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      ofertas_id: DataTypes.INTEGER,
      ciudadano_id: DataTypes.INTEGER,
      fecha: DataTypes.DATE,
      estado: {
        type: DataTypes.STRING(20),
        defaultValue: 'obtenida',
        allowNull: true
      },
      fecha_canjeo: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
      }
    }, {
      tableName: 'tb_canjea_oferta',
      timestamps: false
    });
    
    CanjeaOferta.associate = function(models) {
      CanjeaOferta.belongsTo(models.tb_ofertas, { foreignKey: 'ofertas_id' });
      CanjeaOferta.belongsTo(models.tb_ciudadano, { foreignKey: 'ciudadano_id' });
    };
  
    return CanjeaOferta;
  };
  