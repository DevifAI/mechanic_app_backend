import { DataTypes } from "sequelize";

export default (sequelize) => {
  const PartnerModel = sequelize.define(
    "partner",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Generates a unique ID like MongoDB's ObjectId
        primaryKey: true,
      },
      partner_name: { type: DataTypes.STRING, allowNull: false },
      partner_address: { type: DataTypes.TEXT, allowNull: false },
      partner_gst: { type: DataTypes.STRING, allowNull: false },
      partner_geo_id: { type: DataTypes.BIGINT, allowNull: false },
      isCustomer: { type: DataTypes.BOOLEAN, allowNull: false },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  PartnerModel.associate = (models) => {
  PartnerModel.hasMany(models.ProjectMaster, {
    foreignKey: "customer_id",
    as: "projects",
    scope: {
      isCustomer: true,
    },
  });
};

  return PartnerModel;
};
