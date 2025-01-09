module.exports = (sequelize, DataTypes) => {
    const Roles = sequelize.define('tb_roles', {
      id_rol: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      nombre_rol: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      tableName: 'tb_roles',
      timestamps: false
    });
  
    Roles.associate = function(models) {
      Roles.belongsToMany(models.tb_usuarios, {
        through: models.tb_usuarios_roles,
        foreignKey: 'id_rol',
        otherKey: 'id_usuario',
        as: 'usuarios'
      });
    };
  
    return Roles;
  };
  