module.exports = (sequelize, DataTypes) => {
    const Admin = sequelize.define('tb_admin', {
      admin_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      credencial_id: DataTypes.INTEGER,
      ofertas_id: DataTypes.INTEGER,
      punto_verde_id: DataTypes.INTEGER,
      negocio_id: DataTypes.INTEGER,
      nombre: DataTypes.STRING(25),
      //correo: DataTypes.STRING(50),
      //password: DataTypes.STRING(25)
    }, {
      tableName: 'tb_admin',
      timestamps: false
    });
  
    Admin.associate = function(models) {
      Admin.belongsTo(models.tb_credenciales, { foreignKey: 'credencial_id' });
      Admin.belongsTo(models.tb_ofertas, { foreignKey: 'ofertas_id' });
      Admin.belongsTo(models.tb_puntos_verdes, { foreignKey: 'punto_verde_id' });
      Admin.belongsTo(models.tb_negocio, { foreignKey: 'negocio_id' });
    };
  
    return Admin;
  };
  