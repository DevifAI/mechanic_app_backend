import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";

export default (sequelize) => {
  const EmployeeModel = sequelize.define(
    "employee",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      emp_id: { type: DataTypes.STRING, allowNull: false, unique: true },
      emp_name: { type: DataTypes.STRING, allowNull: false },
      blood_group: { type: DataTypes.STRING, allowNull: false },
      age: { type: DataTypes.INTEGER, allowNull: false },
      adress: { type: DataTypes.TEXT, allowNull: false },
      position: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "emp_positions",
          key: "id",
        },
      },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false },
      shiftcode: { type: DataTypes.STRING, allowNull: false },
      role_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "role",
          key: "id",
        },
      },
      org_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "organisation",
          key: "id",
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      app_access_role: {
        type: DataTypes.ENUM(
          'mechanic',
          'mechanicIncharge',
          'siteIncharge',
          'storeManager',
          'accountManager',
          'projectManager',
          'admin'
        ),
        allowNull: false,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
      hooks: {
        beforeCreate: async (employee) => {
          if (employee.password) {
            const salt = await bcrypt.genSalt(10);
            employee.password = await bcrypt.hash(employee.password, salt);
          }
        },
        beforeUpdate: async (employee) => {
          if (employee.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            employee.password = await bcrypt.hash(employee.password, salt);
          }
        },
      },
    }
  );

  EmployeeModel.associate = function (models) {
    EmployeeModel.belongsTo(models.Role, {
      foreignKey: "role_id",
      as: "role",
    });

    EmployeeModel.belongsToMany(models.Project_Master, {
      through: models.ProjectEmployees,
      foreignKey: "emp_id",
      otherKey: "project_id",
      as: "projects",
    });

    EmployeeModel.belongsTo(models.Shift, {
      foreignKey: "shiftcode",
      targetKey: "shift_code",
      as: "shift",
    });

    EmployeeModel.belongsTo(models.EmpPositionsModel, {
      foreignKey: "position",
      as: "employeePosition",
    });

    EmployeeModel.belongsTo(models.Organisations, {
      foreignKey: "org_id",
      as: "organisation",
    });
  };

  return EmployeeModel;
};