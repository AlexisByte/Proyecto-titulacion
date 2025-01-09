module.exports = (sequelize, DataTypes) => {
    const UsuariosRoles = sequelize.define('tb_usuarios_roles', {
      id_usuario_rol: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'tb_usuarios',
          key: 'id_usuario'
        }
      },
      id_rol: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'tb_roles',
          key: 'id_rol'
        }
      }
    }, {
      tableName: 'tb_usuarios_roles',
      timestamps: true
    });
  
    UsuariosRoles.associate = function(models) {
      UsuariosRoles.belongsTo(models.tb_usuarios, {
        foreignKey: 'id_usuario',
        as: 'usuario'
      });
      UsuariosRoles.belongsTo(models.tb_roles, {
        foreignKey: 'id_rol',
        as: 'rol'
      });
    };
  
    return UsuariosRoles;
  };
  