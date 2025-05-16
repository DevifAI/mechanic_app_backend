import { models } from "../../models/index.js";
const { RevenueMaster } = models;

// Create RevenueMaster
export const createRevenue = async (req, res) => {
  const { revenue_code, revenue_description, revenue_value } = req.body;

  try {
    const newRevenue = await RevenueMaster.create({
      revenue_code,
      revenue_description,
      revenue_value,
    });

    return res.status(201).json(newRevenue);
  } catch (error) {
    console.error("Error creating revenue:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Revenues
export const getAllRevenues = async (req, res) => {
  try {
    const revenues = await RevenueMaster.findAll();
    return res.status(200).json(revenues);
  } catch (error) {
    console.error("Error fetching revenues:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Revenue by ID
export const getRevenueById = async (req, res) => {
  const { id } = req.params;

  try {
    const revenue = await RevenueMaster.findByPk(id);
    if (!revenue) {
      return res.status(404).json({ message: "Revenue not found" });
    }
    return res.status(200).json(revenue);
  } catch (error) {
    console.error("Error fetching revenue:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Revenue
export const updateRevenue = async (req, res) => {
  const { id } = req.params;
  const { revenue_code, revenue_description, revenue_value } = req.body;

  try {
    const revenue = await RevenueMaster.findByPk(id);
    if (!revenue) {
      return res.status(404).json({ message: "Revenue not found" });
    }

    await revenue.update({
      revenue_code,
      revenue_description,
      revenue_value,
    });

    return res.status(200).json(revenue);
  } catch (error) {
    console.error("Error updating revenue:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Revenue
export const deleteRevenue = async (req, res) => {
  const { id } = req.params;

  try {
    const revenue = await RevenueMaster.findByPk(id);
    if (!revenue) {
      return res.status(404).json({ message: "Revenue not found" });
    }

    await revenue.destroy();
    return res.status(200).json({ message: "Revenue deleted successfully" });
  } catch (error) {
    console.error("Error deleting revenue:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
