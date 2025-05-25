import { DataTypes } from 'sequelize';

export const ConsumptionSheetModel = (sequelize) => {
  const ConsumptionSheet = sequelize.define(
    'consumption_sheet',
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
      reading_meter_uom: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reading_meter_number: {
        type: DataTypes.STRING,
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
  ConsumptionSheet.associate = (models) => {
    ConsumptionSheet.belongsTo(models.Equipment, {
      foreignKey: 'equipment',
      as: 'equipmentData',
    });

    ConsumptionSheet.belongsTo(models.ConsumableItem, {
      foreignKey: 'item',
      as: 'itemData',
    });

    ConsumptionSheet.belongsTo(models.UOM, {
      foreignKey: 'uom_id',
      as: 'uomData',
    });

    ConsumptionSheet.belongsTo(models.Employee, {
      foreignKey: 'createdBy',
      as: 'createdByUser',
    });

    ConsumptionSheet.belongsTo(models.Organisations, {
      foreignKey: 'org_id',
      as: 'organisation',
    });
  };

  return ConsumptionSheet;
};
