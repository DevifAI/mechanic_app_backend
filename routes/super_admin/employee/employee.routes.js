import express from "express";
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  bulkUploadEmployees,
} from "../../../controllers/employee/employee.controller.js";
import upload from "../../../middleware/bulkUpload.js";

const router = express.Router();

router.post("/create", createEmployee);
router.get("/getAll", getAllEmployees);
router.get("/get/:id", getEmployeeById);
router.patch("/update/:id", updateEmployee);
router.delete("/delete/:id", deleteEmployee);
router.post("/bulk-upload", upload.single("file"), bulkUploadEmployees);

export default router;
