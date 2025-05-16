import { models } from "../../models/index.js";
const { Shift } = models;

// Create Shift
export const createShift = async (req, res) => {
  try {
    const { shift_code, shift_from_time, shift_to_time } = req.body;
    const newShift = await Shift.create({
      shift_code,
      shift_from_time,
      shift_to_time,
    });
    return res.status(201).json(newShift);
  } catch (error) {
    console.error("Error creating shift:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all Shifts
export const getAllShifts = async (req, res) => {
  try {
    const shifts = await Shift.findAll();
    return res.status(200).json(shifts);
  } catch (error) {
    console.error("Error fetching shifts:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Shift by ID
export const getShiftById = async (req, res) => {
  try {
    const { id } = req.params;
    const shift = await Shift.findByPk(id);
    if (!shift) {
      return res.status(404).json({ message: "Shift not found" });
    }
    return res.status(200).json(shift);
  } catch (error) {
    console.error("Error fetching shift by ID:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Shift
export const updateShift = async (req, res) => {
  try {
    const { id } = req.params;
    const { shift_code, shift_from_time, shift_to_time } = req.body;

    const shift = await Shift.findByPk(id);
    if (!shift) {
      return res.status(404).json({ message: "Shift not found" });
    }

    await shift.update({ shift_code, shift_from_time, shift_to_time });
    return res.status(200).json(shift);
  } catch (error) {
    console.error("Error updating shift:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Shift
export const deleteShift = async (req, res) => {
  try {
    const { id } = req.params;

    const shift = await Shift.findByPk(id);
    if (!shift) {
      return res.status(404).json({ message: "Shift not found" });
    }

    await shift.destroy();
    return res.status(200).json({ message: "Shift deleted successfully" });
  } catch (error) {
    console.error("Error deleting shift:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
