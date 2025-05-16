import { models } from "../../models/index.js";
const { EquipmentGroup } = models;

// Create EquipmentGroup
export const createEquipmentGroup = async (req, res) => {
  const { equip_grp_code, equipment_group } = req.body;

  try {
    const newGroup = await EquipmentGroup.create({
      equip_grp_code,
      equipment_group,
    });

    return res.status(201).json(newGroup);
  } catch (error) {
    console.error("Error creating equipment group:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All EquipmentGroups
export const getAllEquipmentGroups = async (req, res) => {
  try {
    const groups = await EquipmentGroup.findAll();
    return res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching equipment groups:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get EquipmentGroup by ID
export const getEquipmentGroupById = async (req, res) => {
  const { id } = req.params;

  try {
    const group = await EquipmentGroup.findByPk(id);
    if (!group) {
      return res.status(404).json({ message: "Equipment group not found" });
    }
    return res.status(200).json(group);
  } catch (error) {
    console.error("Error fetching equipment group:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update EquipmentGroup
export const updateEquipmentGroup = async (req, res) => {
  const { id } = req.params;
  const { equip_grp_code, equipment_group } = req.body;

  try {
    const group = await EquipmentGroup.findByPk(id);
    if (!group) {
      return res.status(404).json({ message: "Equipment group not found" });
    }

    await group.update({
      equip_grp_code,
      equipment_group,
    });

    return res.status(200).json(group);
  } catch (error) {
    console.error("Error updating equipment group:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete EquipmentGroup
export const deleteEquipmentGroup = async (req, res) => {
  const { id } = req.params;

  try {
    const group = await EquipmentGroup.findByPk(id);
    if (!group) {
      return res.status(404).json({ message: "Equipment group not found" });
    }

    await group.destroy();
    return res
      .status(200)
      .json({ message: "Equipment group deleted successfully" });
  } catch (error) {
    console.error("Error deleting equipment group:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
