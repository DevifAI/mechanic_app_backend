import express from "express";
import {
  createEquipment,
  getAllEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
} from "../../../controllers/equipment/equipment.controller.js";

const router = express.Router();

router.post("/create", createEquipment);
router.get("/getAll/", getAllEquipment);
router.get("/get/:id", getEquipmentById);
router.patch("/update/:id", updateEquipment);
router.delete("/delete/:id", deleteEquipment);

export default router;
