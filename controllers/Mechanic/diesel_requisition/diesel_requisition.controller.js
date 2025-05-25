import db from "../models/index.js"; // adjust the path based on your setup
const DieselRequisition = db.DieselRequisition;

// Create a new diesel requisition
export const createDieselRequisition = async (req, res) => {
  try {
    const requisition = await DieselRequisition.create(req.body);
    return res.status(201).json(requisition);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create requisition", error: error.message });
  }
};

// Get all diesel requisitions
export const getAllDieselRequisitions = async (req, res) => {
  try {
    const requisitions = await DieselRequisition.findAll();
    return res.status(200).json(requisitions);
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve requisitions", error: error.message });
  }
};

// Get a single diesel requisition by ID
export const getDieselRequisitionById = async (req, res) => {
  try {
    const requisition = await DieselRequisition.findByPk(req.params.id);
    if (!requisition) {
      return res.status(404).json({ message: "Requisition not found" });
    }
    return res.status(200).json(requisition);
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve requisition", error: error.message });
  }
};

// Update a diesel requisition
export const updateDieselRequisition = async (req, res) => {
  try {
    const [updated] = await DieselRequisition.update(req.body, {
      where: { id: req.params.id },
    });
    if (!updated) {
      return res.status(404).json({ message: "Requisition not found or no changes made" });
    }
    const updatedRequisition = await DieselRequisition.findByPk(req.params.id);
    return res.status(200).json(updatedRequisition);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update requisition", error: error.message });
  }
};

// Delete a diesel requisition
export const deleteDieselRequisition = async (req, res) => {
  try {
    const deleted = await DieselRequisition.destroy({
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
