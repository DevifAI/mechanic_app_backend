import express from "express";
import {
  createShift,
  getAllShifts,
  getShiftById,
  updateShift,
  deleteShift,
} from "../../../controllers/shift/shift.controller.js"; // Adjust path

const router = express.Router();

router.post("/create", createShift);
router.get("/getAll", getAllShifts);
router.get("/get/:id", getShiftById);
router.patch("/update/:id", updateShift);
router.delete("/delete/:id", deleteShift);

export default router;
