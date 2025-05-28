import express from "express";

import {
  createMaintenanceSheet,
  getAllMaintenanceSheets,
  getMaintenanceSheetById,
  updateMaintenanceSheet,
  deleteMaintenanceSheet,
} from "../../../controllers/Mechanic/maintenance_sheet/maintenance_sheet.controller.js";

const router = express.Router();

router.post("/", createMaintenanceSheet);
router.get("/", getAllMaintenanceSheets);
router.get("/:id", getMaintenanceSheetById);
router.put("/:id", updateMaintenanceSheet);
router.delete("/:id", deleteMaintenanceSheet);

export default router;
