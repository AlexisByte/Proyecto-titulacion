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
    timestamps: true
  });

  Usuarios.associate = function(models) {
    // Relación con Roles (Muchos a Muchos)
    Usuarios.belongsToMany(models.tb_roles, {
      through: models.tb_usuarios_roles,
      foreignKey: 'id_usuario',
      otherKey: 'id_rol',
      as: 'roles'
    });

    // Relación con Evaluaciones (Uno a Muchos)
    Usuarios.hasMany(models.tb_evaluaciones, {
      foreignKey: 'id_usuario',
      as: 'evaluaciones'
    });

    // Relación con Reportes (Uno a Muchos)
    Usuarios.hasMany(models.tb_reportes, {
      foreignKey: 'id_usuario',
      as: 'reportes'
    });

    // Relación con Versiones_Modelos (Uno a Muchos)
    Usuarios.hasMany(models.tb_versiones_modelos, {
      foreignKey: 'id_usuario_creador',
      as: 'versionesCreadas'
    });

    // Relación con Notificaciones (Uno a Muchos - Emisor)
    Usuarios.hasMany(models.tb_notificaciones, {
      foreignKey: 'id_usuario_emisor',
      as: 'notificacionesEnviadas'
    });

    // Relación con Notificaciones (Uno a Muchos - Receptor)
    Usuarios.hasMany(models.tb_notificaciones, {
      foreignKey: 'id_usuario_receptor',
      as: 'notificacionesRecibidas'
    });

    // Relación con Reglas_Negocio (Uno a Muchos)
    Usuarios.hasMany(models.tb_reglas_negocio, {
      foreignKey: 'id_usuario_creador',
      as: 'reglasCreadas'
    });

    // Relación con Auditorias (Uno a Muchos)
    Usuarios.hasMany(models.tb_auditorias, {
      foreignKey: 'id_usuario',
      as: 'auditorias'
    });
  };

  return Usuarios;
};
