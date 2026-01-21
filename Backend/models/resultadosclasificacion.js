module.exports = (sequelize, DataTypes) => {
  const ResultadosClasificacion = sequelize.define('tb_resultados_clasificacion', {
    id_clasificacion: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    id_resultado_entrenamiento: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    tipo_clasificacion: {
      type: DataTypes.ENUM('CSV', 'FORMULARIO'),
      allowNull: false
    },

    resumen_resultado: {
      type: DataTypes.JSON,
      allowNull: false
    },

    archivo_csv_resultado: {
      type: DataTypes.STRING,
      allowNull: true
    },

    fecha_clasificacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }

  }, {
    tableName: 'tb_resultados_clasificacion',
    timestamps: true,
    indexes: [
      { fields: ['id_usuario'] },
      { fields: ['id_resultado_entrenamiento'] },
      { fields: ['fecha_clasificacion'] }
    ]
  });

  ResultadosClasificacion.associate = function(models) {
    ResultadosClasificacion.belongsTo(models.tb_resultados_entrenamiento, {
      foreignKey: 'id_resultado_entrenamiento',
      as: 'modelo_entrenado'
    });

    ResultadosClasificacion.belongsTo(models.tb_usuarios, {
      foreignKey: 'id_usuario',
      as: 'usuario'
    });
  };

  return ResultadosClasificacion;
};
