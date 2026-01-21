const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const ResultadosEntrenamiento = sequelize.define(
    'tb_resultados_entrenamiento',
    {
      id_resultado: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      // 🔹 Modelo IA
      id_version: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      // 🔹 Dataset normal (clasificación)
      id_dataset: {
        type: DataTypes.INTEGER,
        allowNull: true
      },

      // 🔹 Dataset Equifax (score)
      id_equifax_dataset: {
        type: DataTypes.INTEGER,
        allowNull: true
      },

      // 🔹 Métricas (solo clasificación)
      matriz_confusion: {
        type: DataTypes.JSON,
        allowNull: true
      },

      precision: {
        type: DataTypes.FLOAT,
        allowNull: true
      },

      exactitud: {
        type: DataTypes.FLOAT,
        allowNull: true
      },

      recall: {
        type: DataTypes.FLOAT,
        allowNull: true
      },

      f1_score: {
        type: DataTypes.FLOAT,
        allowNull: true
      },

      // 🔹 Ruta al modelo entrenado
      modelo_entrenado: {
        type: DataTypes.STRING,
        allowNull: false
      },

      fecha_entrenamiento: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: 'tb_resultados_entrenamiento',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['id_version', 'id_dataset'],
          where: {
            id_dataset: { [Op.ne]: null }
          }
        },
        {
          unique: true,
          fields: ['id_version', 'id_equifax_dataset'],
          where: {
            id_equifax_dataset: { [Op.ne]: null }
          }
        }
      ]
    }
  );

  ResultadosEntrenamiento.associate = function (models) {
    ResultadosEntrenamiento.belongsTo(models.tb_versiones_modelos, {
      foreignKey: 'id_version',
      as: 'modelo_version',
      onDelete: 'CASCADE'
    });

    ResultadosEntrenamiento.belongsTo(models.tb_datasets, {
      foreignKey: 'id_dataset',
      as: 'dataset'
    });

    ResultadosEntrenamiento.belongsTo(models.tb_equifax_datasets, {
      foreignKey: 'id_equifax_dataset',
      as: 'dataset_equifax'
    });
  };

  return ResultadosEntrenamiento;
};
