import { models } from "../../models/index.js";
const { ConsumableItem, ItemGroup, OEM, UOM, Account, RevenueMaster } = models;

// Create Consumable Item
export const createConsumableItem = async (req, res) => {
  try {
    const item = await ConsumableItem.create(req.body);
    return res.status(201).json(item);
  } catch (error) {
    console.error("Error creating item:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Items with Associations
export const getAllConsumableItems = async (req, res) => {
  try {
    const items = await ConsumableItem.findAll({
      include: [
        { model: ItemGroup, as: "itemGroup" },
        { model: OEM, as: "oem" },
        { model: UOM, as: "uom" },
        { model: Account, as: "inventoryAccount" },
        { model: Account, as: "expenseAccount" },
        { model: RevenueMaster, as: "revenueAccount" },
      ],
    });
    return res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Item by ID
export const getConsumableItemById = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await ConsumableItem.findByPk(id, {
      include: [
        { model: ItemGroup, as: "itemGroup" },
        { model: OEM, as: "oem" },
        { model: UOM, as: "uom" },
        { model: Account, as: "inventoryAccount" },
        { model: Account, as: "expenseAccount" },
        { model: RevenueMaster, as: "revenueAccount" },
      ],
    });
    if (!item) return res.status(404).json({ message: "Item not found" });
    return res.status(200).json(item);
  } catch (error) {
    console.error("Error getting item:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Consumable Item
export const updateConsumableItem = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await ConsumableItem.findByPk(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    await item.update(req.body);
    return res.status(200).json(item);
  } catch (error) {
    console.error("Error updating item:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Consumable Item
export const deleteConsumableItem = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await ConsumableItem.findByPk(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    await item.destroy();
    return res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
