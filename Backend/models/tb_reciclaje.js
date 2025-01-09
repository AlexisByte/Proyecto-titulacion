module.exports = (sequelize, DataTypes) => {
    const Reciclaje = sequelize.define('tb_reciclaje', {
      reciclaje_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      cantidad: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      material_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      descripcion: {
        type: DataTypes.STRING(200),
        allowNull: false
      }
    }, {
      tableName: 'tb_reciclaje',
      timestamps: false
    });
    Reciclaje.associate = function(models) {
      Reciclaje.belongsTo(models.tb_materiales, { foreignKey: 'material_id', as: 'materiales'});
    };
    return Reciclaje;
  };
  