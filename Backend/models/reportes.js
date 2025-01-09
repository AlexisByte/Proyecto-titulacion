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
      tipo_reporte: {
        type: DataTypes.ENUM('Global', 'Individual', 'Historial'),
        allowNull: false
      },
      contenido: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      fecha_generacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'tb_reportes',
      timestamps: false
    });
  
    return Reportes;
  };
  