module.exports = (sequelize, DataTypes) => {
    const Negocio = sequelize.define('tb_negocio', {
      negocio_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      nombre: {
        type: DataTypes.STRING(150),
        allowNull: false
      },
      propietario: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      tipo_negocio: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      direccion: {
        type: DataTypes.STRING(300),
        allowNull: false
      },
      telefono: {
        type: DataTypes.CHAR(10),
        allowNull: false
      },
      image: {
        type: DataTypes.BLOB('long'),
        allowNull: true
      },
      fecharegistro: {
        type: DataTypes.DATE,
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
      tableName: 'tb_negocio',
      timestamps: false
    });
    /*
    Negocio.associate = models => {
      Negocio.hasOne(models.tb_credenciales, { foreignKey: 'usuario_id', as: 'credencial', constraints: false });
    };*/
    return Negocio;
  };
  