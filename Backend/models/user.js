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
      }
    }, {
      tableName: 'tb_usuarios',
      timestamps: false
    });
  
    Usuarios.associate = function(models) {
      // Aquí puedes definir las asociaciones con otras tablas si es necesario
    };
  
    return Usuarios;
  };
  