import { DataTypes } from "sequelize";

export default (sequelize) => {
  const RevenueMasterModel = sequelize.define(
    "revenue_master",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      revenue_code: { type: DataTypes.STRING, allowNull: false },
      revenue_description: { type: DataTypes.STRING, allowNull: false },
      revenue_value: { type: DataTypes.INTEGER },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );
  RevenueMasterModel.associate = (models) => {
    RevenueMasterModel.belongsToMany(models.Project_Master , {
      through: models.ProjectRevenue,
      foreignKey: "revenue_master_id",
      as: "projects",
    });
  };

  return RevenueMasterModel;
};
