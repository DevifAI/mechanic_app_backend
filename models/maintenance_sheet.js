import { DataTypes } from 'sequelize';

export const MaintenanceSheetModel = (sequelize) => {
  const MaintenanceSheet = sequelize.define(
    'maintenance_sheet',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      equipment: {
        type: DataTypes.UUID,
        allowNull: false,
      },
       notes: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      next_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
  action_planned: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      item: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.NUMERIC,
        allowNull: false,
      },
      uom_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      notes: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
     
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      is_approved_mic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_approved_sic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_approved_pm: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      org_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  // Associations
  MaintenanceSheet.associate = (models) => {
    ConsumptionSheet.belongsTo(models.Equipment, {
      foreignKey: 'equipment',
      as: 'equipmentData',
    });

    MaintenanceSheet.belongsTo(models.ConsumableItem, {
      foreignKey: 'item',
      as: 'itemData',
    });

    MaintenanceSheet.belongsTo(models.UOM, {
      foreignKey: 'uom_id',
      as: 'uomData',
    });

    MaintenanceSheet.belongsTo(models.Employee, {
      foreignKey: 'createdBy',
      as: 'createdByUser',
    });

    MaintenanceSheet.belongsTo(models.Organisations, {
      foreignKey: 'org_id',
      as: 'organisation',
    });
  };

  return MaintenanceSheet;
};
