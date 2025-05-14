export const EmpPositionsModel = (sequelize) => {
  const EmpPositionsModel = sequelize.define(
    "emp_positions",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      designation: { type: DataTypes.STRING },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  EmpPositionsModel.associate = function (models) {
    EmpPositionsModel.hasMany(models.Employee, {
      foreignKey: "position",
      as: "employees",
    });
  };
  return EmpPositionsModel;
};
