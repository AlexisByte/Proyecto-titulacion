module.exports = (sequelize, DataTypes) => {
    const Auditorias = sequelize.define('tb_auditorias', {
      id_auditoria: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      accion: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      modulo_afectado: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      fecha_accion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'tb_auditorias',
      timestamps: false
    });
  
    return Auditorias;
  };
  