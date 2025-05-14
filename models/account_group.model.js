export const AccountGroupModel = (sequelize) => {
  const AccountGroupModel = sequelize.define(
    "account_group",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      account_group: { type: DataTypes.STRING, allowNull: false },
      group_name: { type: DataTypes.STRING, allowNull: false },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );
  AccountGroupModel.associate = (models) => {
    AccountGroupModel.hasMany(models.AccountModel, {
      foreignKey: "account_group",
      as: "accounts",
    });
  };

  return AccountGroupModel;
};
