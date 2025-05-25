// models/DieselRequisition.js
import { DataTypes } from 'sequelize';

export const DieselReceiptModel = (sequelize) => {
  const DieselReceipt = sequelize.define(
    'diesel_receipt',
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
      item: {
        type: DataTypes.UUID,
        references: {
          model: 'consumable_items', // Adjust table name if needed
          key: 'id',
        },
        allowNull: false,
      },
      quantity: {
        type: DataTypes.NUMERIC,
        allowNull: false,
      },
      UOM: {
        type: DataTypes.UUID,
        references: {
          model: 'uom', // Adjust table name if needed
          key: 'id',
        },
        allowNull: false,
      },
      Notes: {
        type: DataTypes.STRING(255),
      },
      createdBy: {
        type: DataTypes.UUID,
        references: {
          model: 'employee', // Adjust table name if needed
          key: 'id',
        },
        allowNull: false,
      },
      is_approve_mic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_approve_sic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_approve_pm: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      org_id: {
        type: DataTypes.UUID,
        references: {
          model: 'organisation',
          key: 'id',
        },
        allowNull: true,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  DieselReceipt.associate = (models) => {
  DieselReceipt.belongsTo(models.ConsumableItem, {
    foreignKey: 'item',
    as: 'consumableItem',
  });

  DieselReceipt.belongsTo(models.UOM, {
    foreignKey: 'UOM',
    as: 'unitOfMeasurement',
  });

  DieselReceipt.belongsTo(models.Employee, {
    foreignKey: 'createdBy',
    as: 'createdByEmployee',
  });

  DieselReceipt.belongsTo(models.Organisations, {
    foreignKey: 'org_id',
    as: 'organisation',
  });
};


  return DieselReceipt;
};
