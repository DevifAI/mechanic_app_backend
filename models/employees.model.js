import { DataTypes } from "sequelize";

export default (sequelize) => {
  const EmployeeModel = sequelize.define(
    "employee",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      emp_id: { type: DataTypes.STRING, allowNull: false },
      emp_name: { type: DataTypes.STRING, allowNull: false },
      blood_group: { type: DataTypes.STRING, allowNull: false },
      age: { type: DataTypes.INTEGER, allowNull: false },
      adress: { type: DataTypes.TEXT, allowNull: false },
      position: {
        type: DataTypes.UUID, // Changed from STRING to UUID
        allowNull: false,
        references: {
          model: "emp_positions",
          key: "id",
        },
      },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false },
      shiftcode: { type: DataTypes.STRING, allowNull: false },
      role_id: {
        // Add this field
        type: DataTypes.UUID,
        references: {
          model: "role",
          key: "id",
        },
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  // Define associations after model definition
  EmployeeModel.associate = function (models) {
    EmployeeModel.belongsTo(models.Role, {
      foreignKey: "role_id",
      as: "role",
    });

    EmployeeModel.belongsToMany(models.Project_Master, {
      through: models.ProjectEmployees,
      foreignKey: "emp_id", // 👈 match the column in the join table
      otherKey: "project_id",
      as: "projects",
    });

    EmployeeModel.belongsTo(models.Shift, {
      foreignKey: "shiftcode", // This matches the field in EmployeeModel
      targetKey: "shift_code", // This matches the field in ShiftModel
      as: "shift",
    });

    EmployeeModel.belongsTo(models.EmpPositionsModel, {
      foreignKey: "position",
      as: "employeePosition",
    });
  };

  return EmployeeModel;
};
