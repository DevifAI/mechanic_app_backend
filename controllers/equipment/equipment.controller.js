import { models } from "../../models/index.js";
const { Equipment, EquipmentGroup } = models;

// Create Equipment
export const createEquipment = async (req, res) => {
  const {
    equipment_name,
    equipment_sr_no,
    additional_id,
    purchase_date,
    oem,
    purchase_cost,
    equipment_manual,
    maintenance_log,
    other_log,
    project_tag,
    equipment_group_id,
  } = req.body;

  try {
    // 1. Check if the equipment_group_id is provided and exists
    if (equipment_group_id) {
      const groupExists = await EquipmentGroup.findByPk(equipment_group_id);
      if (!groupExists) {
        return res.status(404).json({ message: "Equipment group not found" });
      }
    }

    const newEquipment = await Equipment.create({
      equipment_name,
      equipment_sr_no,
      additional_id,
      purchase_date,
      oem,
      purchase_cost,
      equipment_manual,
      maintenance_log,
      other_log,
      project_tag,
      equipment_group_id,
    });

    return res.status(201).json(newEquipment);
  } catch (error) {
    console.error("Error creating equipment:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Equipment
export const getAllEquipment = async (req, res) => {
  try {
    const equipments = await Equipment.findAll();
    return res.status(200).json(equipments);
  } catch (error) {
    console.error("Error fetching equipment:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Equipment by ID
export const getEquipmentById = async (req, res) => {
  const { id } = req.params;

  try {
    const equipment = await Equipment.findByPk(id);

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    return res.status(200).json(equipment);
  } catch (error) {
    console.error("Error fetching equipment:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Equipment
export const updateEquipment = async (req, res) => {
  const { id } = req.params;
  const {
    equipment_name,
    equipment_sr_no,
    additional_id,
    purchase_date,
    oem,
    purchase_cost,
    equipment_manual,
    maintenance_log,
    other_log,
    project_tag,
    equipment_group_id,
  } = req.body;

  try {
    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    await equipment.update({
      equipment_name,
      equipment_sr_no,
      additional_id,
      purchase_date,
      oem,
      purchase_cost,
      equipment_manual,
      maintenance_log,
      other_log,
      project_tag,
      equipment_group_id,
    });

    return res.status(200).json(equipment);
  } catch (error) {
    console.error("Error updating equipment:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Equipment
export const deleteEquipment = async (req, res) => {
  const { id } = req.params;

  try {
    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    await equipment.destroy();
    return res.status(200).json({ message: "Equipment deleted successfully" });
  } catch (error) {
    console.error("Error deleting equipment:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
