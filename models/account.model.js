import { DataTypes } from "sequelize";

export const AccountModel = (sequelize) => {
  const Account = sequelize.define(
    "account",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      account_code: { type: DataTypes.STRING, allowNull: false },
      account_name: { type: DataTypes.STRING, allowNull: false },
      account_group: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "account_group", // References the account_group table
          key: "id", // References the id field in account_group
        },
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  Account.associate = (models) => {
    Account.hasMany(models.ConsumableItemsModel, {
      foreignKey: "account_code_in",
      as: "incomingItems",
    });
    Account.hasMany(models.ConsumableItemsModel, {
      foreignKey: "account_code_out",
      as: "outgoingItems",
    });
    Account.belongsTo(models.AccountGroupModel, {
      foreignKey: "account_group",
      as: "group",
    });
  };

  return Account;
};
