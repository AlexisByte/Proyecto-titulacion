module.exports = (sequelize, DataTypes) => {
    const Reportes = sequelize.define('tb_reportes', {
      id_reporte: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      contenido: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    }, {
      tableName: 'tb_reportes',
      timestamps: true
    });
  
    Reportes.associate = function(models) {
      Reportes.belongsTo(models.tb_usuarios, { foreignKey: 'id_usuario', as: 'usuario' });
    };
  
    return Reportes;
  };
  