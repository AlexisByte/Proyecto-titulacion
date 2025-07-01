module.exports = (sequelize, DataTypes) => {
    const Actividad = sequelize.define('tb_actividad', {
        id_actividad: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        accion: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        detalles: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        fecha: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'tb_actividad',
        timestamps: false
    });

    // Asociaciones
    Actividad.associate = function(models) {
        Actividad.belongsTo(models.tb_usuarios, { foreignKey: 'id_usuario', as: 'usuario' });
    };

    return Actividad;
};