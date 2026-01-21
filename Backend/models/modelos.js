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
      allowNull: false
    },
    id_usuario_creador: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    // 🔹 Ruta al archivo .py del modelo
    contenido: {
      type: DataTypes.STRING,
      allowNull: false
    },

    // 🔹 Requisitos (pip / versiones)
    requirements: {
      type: DataTypes.STRING,
      allowNull: true
    },

    // 🆕 TIPO DE MODELO IA
    tipo_modelo: {
      type: DataTypes.ENUM(
        'clasificacion',
        'score'
      ),
      allowNull: false,
      defaultValue: 'clasificacion'
    },

  }, {
    tableName: 'tb_versiones_modelos',
    timestamps: true
  });

  VersionesModelos.associate = function(models) {
    VersionesModelos.belongsTo(models.tb_usuarios, {
      foreignKey: 'id_usuario_creador',
      as: 'creador_modelo'
    });

    VersionesModelos.hasMany(models.tb_resultados_entrenamiento, {
      foreignKey: 'id_version',
      as: 'resultados',
      onDelete: 'CASCADE',
      hooks: true
    });
  };

  return VersionesModelos;
};
