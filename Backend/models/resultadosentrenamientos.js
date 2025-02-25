module.exports = (sequelize, DataTypes) => {
    const ResultadosEntrenamiento = sequelize.define('tb_resultados_entrenamiento', {
        id_resultado: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        id_version: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_dataset: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        fp: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        fn: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        precision: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        exactitud: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        recall: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        fecha_entrenamiento: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'tb_resultados_entrenamiento',
        timestamps: true
    });

    // Asociaciones
    ResultadosEntrenamiento.associate = function(models) {
        ResultadosEntrenamiento.belongsTo(models.tb_versiones_modelos, { foreignKey: 'id_version', as: 'modelo_version' });
        ResultadosEntrenamiento.belongsTo(models.tb_datasets, { foreignKey: 'id_dataset', as: 'dataset' });
    };

    return  ResultadosEntrenamiento;
};
