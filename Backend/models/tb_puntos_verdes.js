module.exports = (sequelize, DataTypes) => {
    const PuntosVerdes = sequelize.define('tb_puntos_verdes', {
      punto_verde_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      descripcion: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      direccion: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      latitud: {
        type: DataTypes.DOUBLE,
        allowNull: false
      },
      longitud: {
        type: DataTypes.DOUBLE,
        allowNull: false
      },
      negocio_id: {
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
      },
    }, {
      tableName: 'tb_puntos_verdes',
      timestamps: false
    });
  
    return PuntosVerdes;
  };
  