import express from "express";
import {
  createEquipmentGroup,
  getAllEquipmentGroups,
  getEquipmentGroupById,
  updateEquipmentGroup,
  deleteEquipmentGroup,
} from "../../../controllers/equipmentGroup/equipmentGroup.controller.js";

const router = express.Router();

router.post("/create", createEquipmentGroup);
router.get("/getAll", getAllEquipmentGroups);
router.get("/get/:id", getEquipmentGroupById);
router.patch("/update/:id", updateEquipmentGroup);
router.delete("/delete/:id", deleteEquipmentGroup);

export default router;
