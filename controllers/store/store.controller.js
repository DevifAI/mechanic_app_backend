import { models } from "../../models/index.js"; // Adjust path as needed
const { Store } = models;

// Create Store
export const createStore = async (req, res) => {
  const { store_code, store_location, store_name } = req.body;

  try {
    const store = await Store.create({
      store_code,
      store_location,
      store_name,
    });
    return res.status(201).json(store);
  } catch (error) {
    console.error("Error creating store:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Stores
export const getStores = async (req, res) => {
  try {
    const stores = await Store.findAll();
    return res.status(200).json(stores);
  } catch (error) {
    console.error("Error fetching stores:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Store by ID
export const getStoreById = async (req, res) => {
  const { id } = req.params;

  try {
    const store = await Store.findByPk(id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    return res.status(200).json(store);
  } catch (error) {
    console.error("Error fetching store:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Store
export const updateStore = async (req, res) => {
  const { id } = req.params;
  const { store_code, store_location, store_name } = req.body;

  try {
    const store = await Store.findByPk(id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    await store.update({ store_code, store_location, store_name });
    return res.status(200).json(store);
  } catch (error) {
    console.error("Error updating store:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Store
export const deleteStore = async (req, res) => {
  const { id } = req.params;

  try {
    const store = await Store.findByPk(id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    await store.destroy();
    return res.status(200).json({ message: "Store deleted successfully" });
  } catch (error) {
    console.error("Error deleting store:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
