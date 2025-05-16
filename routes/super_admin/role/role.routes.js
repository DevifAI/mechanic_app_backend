import express from "express";
import {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
} from "../../../controllers/role/role.controller.js";

const router = express.Router();

router.post("/create", createRole);
router.get("/getall", getAllRoles);
router.get("/get/:id", getRoleById);
router.patch("/update/:id", updateRole);
router.delete("/delete/:id", deleteRole);

export default router;
