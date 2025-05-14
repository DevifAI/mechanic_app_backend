// models/ProjectMechanics.js (for site_mechanic_ids)
export default (sequelize, DataTypes) => {
  return sequelize.define(
    "ProjectEmployees",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      project_id: {
        type: DataTypes.UUID,
        references: { model: "project_master", key: "id" },
      },
      employee_id: {
        type: DataTypes.UUID,
        references: { model: "employee", key: "id" },
      },
      role_id: {
        // Track which role they have in this project
        type: DataTypes.UUID,
        references: { model: "role", key: "id" },
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );
};

// Repeat similar structure for:
// - ProjectSupervisors.js (site_supervisor_ids)
// - ProjectManagers.js (site_manager_ids)
// - ProjectStoreManagers.js (site_store_manager_ids)
