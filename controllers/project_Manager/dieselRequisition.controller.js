import { Op } from "sequelize";
import { models } from "../../models/index.js";
const {
    DieselRequisitions,
    DieselRequisitionItems,
    ConsumableItem,
    UOM,
    OEM,
    Employee,
    Organisations,
} = models;

export const getAllDieselRequisitions = async (req, res) => {
    try {
        const { projectId } = req.body;

        const requisitions = await DieselRequisitions.findAll({
            where: {
                project_id: projectId,
                is_approve_mic: {
                    [Op.in]: ["pending", "approved"], // Correct usage of IN operator
                },
                is_approve_sic: {
                    [Op.in]: ["pending", "approved"], // Correct usage of IN operator
                },
            },
            include: [
                {
                    model: DieselRequisitionItems,
                    as: "items",
                    include: [
                        {
                            model: ConsumableItem,
                            as: "consumableItem",
                            attributes: ["id", "item_name", "item_description"],
                        },
                        {
                            model: UOM,
                            as: "unitOfMeasurement",
                            attributes: ["id", "unit_name", "unit_code"],
                        },
                    ],
                },
                {
                    model: Employee,
                    as: "createdByEmployee",
                    attributes: ["id", "emp_name"],
                },
                {
                    model: Organisations,
                    as: "organisation",
                    attributes: ["id", "org_name"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json(requisitions);
    } catch (error) {
        console.error("Error retrieving diesel requisitions:", error);
        return res.status(500).json({
            message: "Failed to retrieve requisitions",
            error: error.message,
        });
    }
};

export const getPendingDieselRequisitions = async (req, res) => {
    try {
        const { projectId } = req.body;

        const requisitions = await DieselRequisitions.findAll({
            where: {
                project_id: projectId,
                is_approve_sic: {
                    [Op.in]: ["pending", "approved"], // Correct usage of IN operator
                },
                is_approve_mic: {
                    [Op.in]: ["pending", "approved"], // Correct usage of IN operator
                },
                is_approve_pm: "pending",
            },
            include: [
                {
                    model: DieselRequisitionItems,
                    as: "items",
                    include: [
                        {
                            model: ConsumableItem,
                            as: "consumableItem",
                            attributes: ["id", "item_name", "item_description"],
                        },
                        {
                            model: UOM,
                            as: "unitOfMeasurement",
                            attributes: ["id", "unit_name", "unit_code"],
                        },
                    ],
                },
                {
                    model: Employee,
                    as: "createdByEmployee",
                    attributes: ["id", "emp_name"],
                },
                {
                    model: Organisations,
                    as: "organisation",
                    attributes: ["id", "org_name"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json(requisitions);
    } catch (error) {
        console.error("Error retrieving diesel requisitions:", error);
        return res.status(500).json({
            message: "Failed to retrieve requisitions",
            error: error.message,
        });
    }
};
export const getCompleteDieselRequisitions = async (req, res) => {
    try {
        const { projectId } = req.body;

        const requisitions = await DieselRequisitions.findAll({
            where: {
                project_id: projectId,
                is_approve_sic: "approved",
                is_approve_pm: "approved",
                is_approve_mic: {
                    [Op.in]: ["approved"], // Correct usage of IN operator
                },
            },
            include: [
                {
                    model: DieselRequisitionItems,
                    as: "items",
                    include: [
                        {
                            model: ConsumableItem,
                            as: "consumableItem",
                            attributes: ["id", "item_name", "item_description"],
                        },
                        {
                            model: UOM,
                            as: "unitOfMeasurement",
                            attributes: ["id", "unit_name", "unit_code"],
                        },
                    ],
                },
                {
                    model: Employee,
                    as: "createdByEmployee",
                    attributes: ["id", "emp_name"],
                },
                {
                    model: Organisations,
                    as: "organisation",
                    attributes: ["id", "org_name"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json(requisitions);
    } catch (error) {
        console.error("Error retrieving diesel requisitions:", error);
        return res.status(500).json({
            message: "Failed to retrieve requisitions",
            error: error.message,
        });
    }
};

export const updateDieselRequisitionMicApproval = async (req, res) => {
    try {
        const { requisitionId, status, reason_reject } = req.body;

        const allowedStatuses = ["approved", "pending", "rejected"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid approval status. Must be 'approved', 'pending', or 'rejected'." });
        }

        const requisition = await DieselRequisitions.findByPk(requisitionId);

        if (!requisition) {
            return res.status(404).json({ message: "Diesel requisition not found." });
        }

        requisition.is_approve_pm = status;

        if (status === "rejected") {
            if (!reason_reject || reason_reject.trim() === "") {
                return res.status(400).json({ message: "Rejection reason is required when status is 'rejected'." });
            }
            requisition.reject_reason = reason_reject;
        } else {
            requisition.reject_reason = null; // clear rejection reason if not rejected
        }

        await requisition.save();

        return res.status(200).json({
            message: "Project Manager approval status updated successfully.",
            requisition,
        });
    } catch (error) {
        console.error("Error updating Project Manager approval:", error);
        return res.status(500).json({
            message: "Failed to update Project Manager approval status.",
            error: error.message,
        });
    }
};

