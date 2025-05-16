import { DataTypes } from "sequelize";

export default (sequelize) => {
  const ProjectEmployees = sequelize.define(
    "ProjectEmployees",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      project_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "project_master", key: "id" },
      },
      employee_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "employee", key: "id" },
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  return ProjectEmployees;
};
