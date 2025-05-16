import express from "express";
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from "../../../controllers/employee/employee.controller.js";

const router = express.Router();

router.post("/create", createEmployee);
router.get("/getAll", getAllEmployees);
router.get("/get/:id", getEmployeeById);
router.patch("/get/:id", updateEmployee);
router.delete("/delete/:id", deleteEmployee);

export default router;
