import { models } from "../../models/index.js"; // adjust path if needed
const { ItemGroup } = models;

// Create a new ItemGroup
export const createItemGroup = async (req, res) => {
  try {
    const { group_name, group_code } = req.body;
    const newItemGroup = await ItemGroup.create({ group_name, group_code });
    res.status(201).json(newItemGroup);
  } catch (error) {
    console.error("Error creating ItemGroup:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all ItemGroups
export const getAllItemGroups = async (req, res) => {
  try {
    const itemGroups = await ItemGroup.findAll({
      include: [{ model: models.ConsumableItem, as: "consumableItems" }],
    });
    res.json(itemGroups);
  } catch (error) {
    console.error("Error fetching ItemGroups:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get ItemGroup by ID
export const getItemGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const itemGroup = await ItemGroup.findByPk(id, {
      include: [{ model: models.ConsumableItem, as: "consumableItems" }],
    });

    if (!itemGroup) {
      return res.status(404).json({ error: "ItemGroup not found" });
    }

    res.json(itemGroup);
  } catch (error) {
    console.error("Error fetching ItemGroup:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update an ItemGroup by ID
export const updateItemGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { group_name, group_code } = req.body;

    const itemGroup = await ItemGroup.findByPk(id);
    if (!itemGroup) {
      return res.status(404).json({ error: "ItemGroup not found" });
    }

    await itemGroup.update({ group_name, group_code });
    res.json(itemGroup);
  } catch (error) {
    console.error("Error updating ItemGroup:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete an ItemGroup by ID
export const deleteItemGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const itemGroup = await ItemGroup.findByPk(id);

    if (!itemGroup) {
      return res.status(404).json({ error: "ItemGroup not found" });
    }

    await itemGroup.destroy();
    res.json({ message: "ItemGroup deleted successfully" });
  } catch (error) {
    console.error("Error deleting ItemGroup:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
