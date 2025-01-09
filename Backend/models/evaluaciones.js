module.exports = (sequelize, DataTypes) => {
    const Evaluaciones = sequelize.define('tb_evaluaciones', {
      id_evaluacion: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      id_solicitante: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      resultado: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      detalles: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      tableName: 'tb_evaluaciones',
      timestamps: false
    });
  
    return Evaluaciones;
  };
  