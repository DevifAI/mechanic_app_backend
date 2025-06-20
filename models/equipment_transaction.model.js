import { DataTypes } from "sequelize";

export default (sequelize) => {
    const EquipmentTransactionModel = sequelize.define(
        "equipment_transaction",
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
            date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },

            data_type: {
                type: DataTypes.ENUM("equipment_in", "equipment_out"),
                allowNull: false,
            },

            type: {
                type: DataTypes.ENUM("New", "Transfer", "Repair", "Site Return", "Rent"),
                allowNull: false,
            },

            partner: {
                type: DataTypes.UUID,
                allowNull: true,
                references: { model: "partner", key: "id" },
            },
            is_approve_pm: {
                type: DataTypes.ENUM("pending", "approved", "rejected"),
                defaultValue: "pending",
            },
        },
        {
            timestamps: true,
            freezeTableName: true,

            hooks: {
                beforeCreate: async (transaction) => {
                    // Make challan_no null for material_out
                    if (transaction.data_type === "material_out") {
                        transaction.challan_no = null;
                    }

                    // If type is not Repair or Site Return, partner should be null
                    if (!["Repair", "Site Return", "Rent"].includes(transaction.type)) {
                        transaction.partner = null;
                    }
                },
            },
        }
    );

    EquipmentTransactionModel.associate = (models) => {
        EquipmentTransactionModel.belongsTo(models.Partner, {
            foreignKey: "partner",
            as: "partnerDetails",
        });
        EquipmentTransactionModel.hasMany(models.EquipmentTransactionsForm, {
            foreignKey: "equipment_transaction_id",
            as: "formItems",
        });

        EquipmentTransactionModel.belongsTo(models.Project_Master, {
            foreignKey: "project_id",
            as: "project",
        });

    };

    return EquipmentTransactionModel;
};
