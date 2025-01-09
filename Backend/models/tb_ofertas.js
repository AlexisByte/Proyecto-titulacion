module.exports = (sequelize, DataTypes) => {
    const Ofertas = sequelize.define('tb_ofertas', {
      ofertas_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      descripcion: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      gc_necesarios: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      negocio_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      fecha_inicio: {
        type: DataTypes.DATE,
        allowNull: false
      },
      fecha_fin: {
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
      tableName: 'tb_ofertas',
      timestamps: false
    });
  
    Ofertas.associate = function(models) {
      Ofertas.belongsTo(models.tb_negocio, { foreignKey: 'negocio_id' });
    };
  
    return Ofertas;
  };
  