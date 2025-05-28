
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

  ConsumptionSheet.associate = (models) => {
    ConsumptionSheet.belongsTo(models.Employee, {
      foreignKey: 'createdBy',
      as: 'createdByUser',
    });

    ConsumptionSheet.belongsTo(models.Organisations, {
      foreignKey: 'org_id',
      as: 'organisation',
    });

    // new: one-to-many relation
    ConsumptionSheet.hasMany(models.ConsumptionSheetItem, {
      foreignKey: 'consumption_sheet_id',
      as: 'items',
      onDelete: 'CASCADE',
    });
  };

  return ConsumptionSheet;
};
