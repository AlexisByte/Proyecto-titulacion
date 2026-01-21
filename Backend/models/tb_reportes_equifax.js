module.exports = (sequelize, DataTypes) => {
  const ReportesEquifax = sequelize.define('tb_reportes_equifax', {

    id_reporte_equifax: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    // 🔹 Nuevo: Nombre del reporte
    nombre_reporte: {
      type: DataTypes.STRING,
      allowNull: false
    },

    // 🔹 Score Equifax
    score_equifax: {
      type: DataTypes.FLOAT,
      allowNull: false
    },

    // 🔹 Nuevo: Score por reglas
    score_reglas: {
      type: DataTypes.FLOAT,
      allowNull: false
    },

    // 🔹 Score interno (IA o promedio)
    score_interno: {
      type: DataTypes.FLOAT,
      allowNull: false
    },

    // 🔹 Riesgo final
    riesgo_final: {
      type: DataTypes.ENUM('RIESGO BAJO', 'RIESGO MEDIO', 'RIESGO ALTO'),
      allowNull: false
    },

    // 🔹 Datos completos de Equifax (JSON)
    datos_equifax: {
      type: DataTypes.JSON,
      allowNull: false
    },

    // 🔹 Archivo PDF u origen
    archivo_origen: {
      type: DataTypes.STRING,
      allowNull: false
    },

    fecha_analisis: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }

  }, {
    tableName: 'tb_reportes_equifax',
    timestamps: true
  });

  ReportesEquifax.associate = function(models) {
    ReportesEquifax.belongsTo(models.tb_usuarios, {
      foreignKey: 'id_usuario',
      as: 'usuario'
    });
  };

  return ReportesEquifax;
};
