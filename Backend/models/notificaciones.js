module.exports = (sequelize, DataTypes) => {
    const Notificaciones = sequelize.define('tb_notificaciones', {
      id_notificacion: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      id_usuario_receptor: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      id_usuario_emisor: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      mensaje: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      estado: {
        type: DataTypes.ENUM('Pendiente', 'Leída', 'Archivada'),
        defaultValue: 'Pendiente'
      },
      fecha_envio: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'tb_notificaciones',
      timestamps: false
    });
  
    return Notificaciones;
  };
  