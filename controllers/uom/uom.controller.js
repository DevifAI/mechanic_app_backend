import { models } from "../../models/index.js";
const { UOM } = models;

// Create a UOM
export const createUOM = async (req, res) => {
  const { unit_code, unit_name } = req.body;

  try {
    // Check if unit_code already exists
    const existingUOM = await UOM.findOne({ where: { unit_code } });
    if (existingUOM) {
      return res.status(400).json({ message: "UOM with this unit_code already exists" });
    }

    // Create new UOM
    const uom = await UOM.create({ unit_code, unit_name });
    return res.status(201).json(uom);
  } catch (error) {
    console.error("Error creating UOM:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all UOMs
export const getUOMs = async (req, res) => {
  try {
    const uoms = await UOM.findAll();
    return res.status(200).json(uoms);
  } catch (error) {
    console.error("Error fetching UOMs:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get UOM by ID
export const getUOMById = async (req, res) => {
  const { id } = req.params;

  try {
    const uom = await UOM.findByPk(id);
    if (!uom) {
      return res.status(404).json({ message: "UOM not found" });
    }
    return res.status(200).json(uom);
  } catch (error) {
    console.error("Error fetching UOM:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update UOM
export const updateUOM = async (req, res) => {
  const { id } = req.params;
  const { unit_code, unit_name } = req.body;

  try {
    const uom = await UOM.findByPk(id);
    if (!uom) {
      return res.status(404).json({ message: "UOM not found" });
    }

    // If unit_code is being updated, check uniqueness
    if (unit_code && unit_code !== uom.unit_code) {
      const existingUOM = await UOM.findOne({ where: { unit_code } });
      if (existingUOM) {
        return res.status(400).json({ message: "UOM with this unit_code already exists" });
      }
    }

    await uom.update({ unit_code, unit_name });
    return res.status(200).json(uom);
  } catch (error) {
    console.error("Error updating UOM:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete UOM
export const deleteUOM = async (req, res) => {
  const { id } = req.params;

  try {
    const uom = await UOM.findByPk(id);
    if (!uom) {
      return res.status(404).json({ message: "UOM not found" });
    }

    await uom.destroy();
    return res.status(200).json({ message: "UOM deleted successfully" });
  } catch (error) {
    console.error("Error deleting UOM:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
