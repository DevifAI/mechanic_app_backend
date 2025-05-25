

import { models } from "../../../models/index.js"; // adjust path if needed
const { DieselReceipt, ConsumableItem,UOM,OEM,Employee, Organisations } = models;


// Create a new diesel requisition
export const createDieselReciept = async (req, res) => {
  try {
    const {
      date,
      items,
      createdBy,
      is_approve_mic = false,
      is_approve_sic = false,
      is_approve_pm = false,
      org_id
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items array is required." });
    }

    const createdRecords = [];

    for (const entry of items) {
      const newEntry = await DieselReceipt.create({
        date,
        item: entry.item,
        quantity: entry.quantity,
        UOM: entry.UOM,
        Notes: entry.Notes || "",
        createdBy,
        is_approve_mic,
        is_approve_sic,
        is_approve_pm,
        org_id
      });

      createdRecords.push(newEntry);
    }

    return res.status(201).json({
      message: "Diesel requisitions created successfully",
      data: createdRecords,
    });
  } catch (error) {
    console.error("Error creating diesel requisitions:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Get all diesel requisitions
export const getAllDieselReciept = async (req, res) => {
  try {
    const receipt = await DieselReceipt.findAll({
      include: [
        {
          model: ConsumableItem,
          as: 'consumableItem',
          attributes: ['id', 'item_name', 'item_description'], // adjust fields
        },
        {
          model: UOM,
          as: 'unitOfMeasurement',
          attributes: ['id', 'unit_name', 'unit_code'], // adjust fields
        },
        {
          model: Employee,
          as: 'createdByEmployee',
          attributes: ['id', 'emp_name'], // adjust fields
        },
        {
          model: Organisations,
          as: 'organisation',
          attributes: ['id', 'org_name'], // adjust fields
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json(receipt);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Failed to retrieve requisitions', error: error.message });
  }
};


// Get a single diesel requisition by ID
export const getDieselRecieptById = async (req, res) => {
  try {
    const requisition = await DieselReceipt.findByPk(req.params.id);
    if (!requisition) {
      return res.status(404).json({ message: "Requisition not found" });
    }
    return res.status(200).json(requisition);
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve requisition", error: error.message });
  }
};

// Update a diesel requisition
export const updateDieselReceipt = async (req, res) => {
  try {
    const [updated] = await DieselReceipt.update(req.body, {
      where: { id: req.params.id },
    });
    if (!updated) {
      return res.status(404).json({ message: "Requisition not found or no changes made" });
    }
    const updatedReciept = await DieselReceipt.findByPk(req.params.id);
    return res.status(200).json(updatedReciept);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update requisition", error: error.message });
  }
};

// Delete a diesel requisition
export const deleteDieselRequisition = async (req, res) => {
  try {
    const deleted = await DieselReceipt.destroy({
      where: { id: req.params.id },
    });
    if (!deleted) {
      return res.status(404).json({ message: "Requisition not found" });
    }
    return res.status(200).json({ message: "Requisition deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete requisition", error: error.message });
  }
};
