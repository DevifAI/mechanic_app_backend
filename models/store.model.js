import { DataTypes } from "sequelize";

export default (sequelize) => {
  const StoreModel = sequelize.define(
    "store",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      store_code: { type: DataTypes.STRING, allowNull: false },
      store_location: { type: DataTypes.STRING, allowNull: false },
      store_name: { type: DataTypes.STRING },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );
  StoreLocationModel.associate = (models) => {
    StoreLocationModel.belongsToMany(models.ProjectMaster, {
      through: "ProjectStoreLocation",
      foreignKey: "store_location_id",
      otherKey: "project_id",
      as: "projects",
    });
  };
  return StoreModel;
};
