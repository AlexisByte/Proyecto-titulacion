module.exports = (sequelize, DataTypes) => {
    const Materiales = sequelize.define('tb_materiales', {
      materiales_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      tipo: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      valor_por_libra: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      fechacreacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      }
    }, {
      tableName: 'tb_materiales',
      timestamps: false
    });
    
    return Materiales;
  };
  