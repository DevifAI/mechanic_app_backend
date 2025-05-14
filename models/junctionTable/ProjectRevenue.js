// models/ProjectRevenue.js
export default (sequelize, DataTypes) => {
  return sequelize.define('project_revenue', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    project_id: {
      type: DataTypes.UUID,
      references: { model: 'project_master', key: 'id' }
    },
    revenue_master_id: {
      type: DataTypes.UUID,
      references: { model: 'revenue_master', key: 'id' }
    },
    // You can add additional fields like:
    // assigned_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    timestamps: true,
    freezeTableName: true
  });
};