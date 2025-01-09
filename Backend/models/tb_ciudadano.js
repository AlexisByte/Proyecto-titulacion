module.exports = (sequelize, DataTypes) => {
    const Ciudadano = sequelize.define('tb_ciudadano', {
      ciudadano_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      greencoin_id: DataTypes.INTEGER,
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      apellido: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      telefono: {
        type: DataTypes.CHAR(10),
        allowNull: false
      },
      fecha_nac: {
        type: DataTypes.DATE,
        allowNull: false
      },
      fecharegistro: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      /*fechacreacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      }*/
    }, {
      tableName: 'tb_ciudadano',
      timestamps: false
    });
  
    Ciudadano.associate = function(models) {
      Ciudadano.belongsTo(models.tb_greencoin_cdn, { foreignKey: 'greencoin_id'});
    };
  
    return Ciudadano;
  };
  