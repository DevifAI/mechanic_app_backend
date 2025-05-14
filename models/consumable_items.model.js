import { DataTypes } from "sequelize";

export const ConsumableItemsModel = (sequelize) => {
  const ConsumableItem = sequelize.define(
    "consumable_items",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      item_code: { type: DataTypes.STRING, allowNull: false },
      item_name: { type: DataTypes.STRING, allowNull: false },
      item_description: { type: DataTypes.TEXT, allowNull: false },
      product_type: { type: DataTypes.STRING, allowNull: false },
      item_make: { type: DataTypes.STRING, allowNull: false },
      unit_of_measurement: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "uom", // This references the table name
          key: "id",
        },
      },
      item_qty_in_hand: { type: DataTypes.INTEGER, allowNull: false },
      account_code_in: {
        type: DataTypes.UUID, // Changed from STRING to UUID
        allowNull: false,
        references: {
          model: "account",
          key: "id",
        },
      },
      account_code_out: {
        type: DataTypes.UUID, // Changed from STRING to UUID
        allowNull: false,
        references: {
          model: "account",
          key: "id",
        },
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  ConsumableItem.associate = (models) => {
    // Link to AccountModel via account_code
    ConsumableItem.belongsTo(models.AccountModel, {
      foreignKey: "account_code_in",
      as: "accountIn",
    });
    ConsumableItem.belongsTo(models.AccountModel, {
      foreignKey: "account_code_out",
      as: "accountOut",
    });

    // Link to UOM model
    ConsumableItem.belongsTo(models.UOMModel, {
      foreignKey: "unit_of_measurement",
      as: "uom",
    });
  };

  return ConsumableItem;
};
