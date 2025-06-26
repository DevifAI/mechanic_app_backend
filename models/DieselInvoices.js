import { DataTypes } from "sequelize";

export default (sequelize) => {
  const DieselInvoiceModel = sequelize.define(
    "diesel_invoice",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      project_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "project_master",
          key: "id",
        },
      },
      dieselInvoiceId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "diesel_invoice", // <-- parent table
          key: "id",
        },
      },
      is_invoiced: {
        type: DataTypes.ENUM("draft", "invoiced", "rejected"),
        defaultValue: "draft",
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  // ✅ Associations
  DieselInvoiceModel.associate = (models) => {
    DieselInvoiceModel.belongsTo(models.Project_Master, {
      foreignKey: "project_id",
      as: "project",
    });

    DieselInvoiceModel.belongsTo(models.DieselReceipt, {
      foreignKey: "dieselInvoiceId",
      as: "invoice",
    });
  };

  return DieselInvoiceModel;
};
