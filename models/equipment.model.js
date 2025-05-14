export const EquipmentModel = (sequelize) => {
  const EquipmentModel = sequelize.define(
    "equipment",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      equipment_name: { type: DataTypes.STRING, allowNull: false },
      equipment_sr_no: { type: DataTypes.STRING, allowNull: false },
      additional_id: { type: DataTypes.STRING, allowNull: false },
      purchase_date: { type: DataTypes.DATE, allowNull: false },
      oem: { type: DataTypes.STRING, allowNull: false },
      purchase_cost: { type: DataTypes.INTEGER, allowNull: false },
      equipment_manual: { type: DataTypes.TEXT, allowNull: false },
      maintenance_log: { type: DataTypes.JSON, allowNull: false },
      other_log: { type: DataTypes.JSON, allowNull: false },
      project_tag: { type: DataTypes.JSON, allowNull: false },
      equipment_group_id: {  // New field
        type: DataTypes.UUID,
        allowNull: true,  // Set to false if every equipment must belong to a group
        references: {
          model: 'equipment_group',  // References the equipment_group table
          key: 'id'
        }
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );
  EquipmentModel.associate = (models) => {
    EquipmentModel.belongsToMany(models.ProjectMaster, {
      through: models.EquipmentProject, // Join table
      foreignKey: "equipment_id",
      as: "projects", // Optional alias
    });
     EquipmentModel.belongsTo(models.EquipmentGroup, {
      foreignKey: "equipment_group_id",
      as: "equipmentGroup",
    });
  };
  return EquipmentModel;
};
