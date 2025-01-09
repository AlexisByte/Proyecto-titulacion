module.exports = (sequelize, DataTypes) => {
    const Usuarios = sequelize.define('tb_usuarios', {
      id_usuario: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
      contrasena: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'tb_usuarios',
      timestamps: false
    });
  
    Usuarios.associate = function(models) {
      Usuarios.belongsToMany(models.tb_roles, {
        through: models.tb_usuarios_roles,
        foreignKey: 'id_usuario',
        otherKey: 'id_rol',
        as: 'roles'
      });
    };
  
    return Usuarios;
  };
  