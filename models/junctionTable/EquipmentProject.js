// models/EquipmentProject.js
export default (sequelize, DataTypes) => {
  const EquipmentProject = sequelize.define('EquipmentProject', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    equipment_id: {
      type: DataTypes.UUID,
      references: {
        model: 'equipment',
        key: 'id',
      },
    },
    project_id: {
      type: DataTypes.UUID,
      references: {
        model: 'project_master',
        key: 'id',
      },
    },
    // Optional: Add metadata like assignment_date, assigned_by, etc.
    assignment_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    timestamps: true,
    freezeTableName: true,
  });

  return EquipmentProject;
};