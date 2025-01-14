module.exports = (sequelize, DataTypes) => {
    const ReglasNegocio = sequelize.define('tb_reglas_negocio', {
      id_regla: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      nombre_regla: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      valor_parametro: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      id_usuario_creador: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }, {
      tableName: 'tb_reglas_negocio',
      timestamps: true
    });
  
    ReglasNegocio.associate = function(models) {
      ReglasNegocio.belongsTo(models.tb_usuarios, { foreignKey: 'id_usuario_creador', as: 'creador' });
    };
  
    return ReglasNegocio;
  };
  