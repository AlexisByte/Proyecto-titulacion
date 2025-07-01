module.exports = (sequelize, DataTypes) => {
    const Datasets = sequelize.define('tb_datasets', {
        id_dataset: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        archivo: {
            type: DataTypes.TEXT, // Ruta o URL del dataset almacenado
            allowNull: false
        },
        inf_columnas: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        id_usuario_creador: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'tb_datasets',
        timestamps: true
    });

    
    // Asociaciones
    Datasets.associate = function(models) {
        Datasets.belongsTo(models.tb_usuarios, { foreignKey: 'id_usuario_creador', as: 'usuario_creador' });
        Datasets.hasMany(models.tb_resultados_entrenamiento, { foreignKey: 'id_dataset', as: 'resultados' });
    };

    return Datasets ;
};
