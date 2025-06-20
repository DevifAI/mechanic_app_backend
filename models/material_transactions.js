import { DataTypes } from "sequelize";

export default (sequelize) => {
    const MaterialTransactionModel = sequelize.define(
        "material_transaction",
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
                type: DataTypes.ENUM("material_in", "material_out"),
                allowNull: false,
            },

            type: {
                type: DataTypes.ENUM("New", "Transfer", "Repair", "Site Return", "Consumption", "Rent"),
                allowNull: false,
            },

            partner: {
                type: DataTypes.UUID,
                allowNull: true,
                references: { model: "partner", key: "id" },
            },

            challan_no: {
                type: DataTypes.STRING,
                allowNull: true,
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
                    if (!["Repair", "Rent", "Site Return"].includes(transaction.type)) {
                        transaction.partner = null;
                    }
                },
            },
        }
    );

    MaterialTransactionModel.associate = (models) => {
        MaterialTransactionModel.belongsTo(models.Partner, {
            foreignKey: "partner",
            as: "partnerDetails",
        });
        MaterialTransactionModel.hasMany(models.MaterialTransactionForm, {
            foreignKey: "material_transaction_id",
            as: "formItems",
        });

        MaterialTransactionModel.belongsTo(models.Project_Master, {
            foreignKey: "project_id",
            as: "project",
        });

    };

    return MaterialTransactionModel;
};
