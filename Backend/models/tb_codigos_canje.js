module.exports = (sequelize, DataTypes) => {
const CodigoCanje = sequelize.define('tb_codigos_canje', {
    codigo_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    codigo: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    ofertas_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'tb_ofertas',
            key: 'ofertas_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
    },
    negocio_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'tb_negocio',
            key: 'negocio_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
    },
    ciudadano_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'tb_ciudadano',
            key: 'ciudadano_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
    },
    fecha_generacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    estado: {
        type: DataTypes.STRING(20),
        defaultValue: 'GENERADO',
    },
    fecha_validacion: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'tb_codigos_canje',
    timestamps: false,
});

CodigoCanje.associate = function(models) {
    CodigoCanje.belongsTo(models.tb_ofertas, { foreignKey: 'ofertas_id' , constraints: false });
    CodigoCanje.belongsTo(models.tb_ciudadano, { foreignKey: 'ciudadano_id' , constraints: false });
};

return CodigoCanje;
};