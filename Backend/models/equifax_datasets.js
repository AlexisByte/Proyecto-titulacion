module.exports = (sequelize, DataTypes) => {
  const EquifaxDatasets = sequelize.define('tb_equifax_datasets', {
    id_equifax_dataset: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    archivo_csv: {
      type: DataTypes.TEXT, // Ruta al CSV consolidado
      allowNull: false
    },
    total_registros: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    score_equifax_promedio: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true
    }
  }, {
    tableName: 'tb_equifax_datasets',
    timestamps: true
  });

  EquifaxDatasets.associate = function(models) {
    EquifaxDatasets.belongsTo(models.tb_usuarios, {
      foreignKey: 'id_usuario',
      as: 'usuario'
    });
  };

  return EquifaxDatasets;
};
