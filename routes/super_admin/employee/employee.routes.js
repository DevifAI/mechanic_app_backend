import express from "express";
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  bulkUploadEmployees,
  getEmployeesByRole,
  getAllEmployeesGroupedByRole,
  getProjectsByEmployeeId,
  addEmployeesToProject,
  getEmployeesByProject,
  getEmployeesByProjectWithRoleType,
  updateEmployeesForProject,
} from "../../../controllers/employee/employee.controller.js";
import upload from "../../../middleware/bulkUpload.js";
import jwtMiddleware from "../../../middleware/jwtMiddleware.js";

const router = express.Router();

router.post("/create", jwtMiddleware, createEmployee);
router.get("/getAll", jwtMiddleware, getAllEmployees);
router.get("/get/:id", jwtMiddleware, getEmployeeById);
router.get("/get/projects/:id", getProjectsByEmployeeId);
router.patch("/update/:id", jwtMiddleware, updateEmployee);
router.delete("/delete/:id", jwtMiddleware, deleteEmployee);
router.post(
  "/bulk-upload",
  upload.single("file"),
  jwtMiddleware,
  bulkUploadEmployees
);
router.get("/role/:id", jwtMiddleware, getEmployeesByRole);
router.get("/grouped-by-role", jwtMiddleware, getAllEmployeesGroupedByRole);
// POST /api/project-employees/add
router.post("/add/employee/project", jwtMiddleware, addEmployeesToProject);
router.post("/edit/employee/project", jwtMiddleware, updateEmployeesForProject);
router.post("/get/employee/project", jwtMiddleware, getEmployeesByProject);
router.post(
  "/get/employee/project/roleType",
  jwtMiddleware,
  getEmployeesByProjectWithRoleType
);
export default router;
