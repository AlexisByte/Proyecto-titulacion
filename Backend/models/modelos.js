module.exports = (sequelize, DataTypes) => {
    const VersionesModelos = sequelize.define('tb_versiones_modelos', {
      id_version: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      nombre_modelo: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      version: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      id_usuario_creador: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      contenido: {
        type: DataTypes.STRING,
        allowNull: true
      }
    }, {
      tableName: 'tb_versiones_modelos',
      timestamps: true
    });
  
    VersionesModelos.associate = function(models) {
      VersionesModelos.belongsTo(models.tb_usuarios, { foreignKey: 'id_usuario_creador', as: 'usuario_creador' });
    };
  
    return VersionesModelos;
  };
  