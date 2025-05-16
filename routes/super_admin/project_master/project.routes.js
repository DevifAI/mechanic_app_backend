import express from "express";
import { createProject, deleteProject, getProjectById, getProjects, updateProject } from "../../../controllers/project_master/project_master.controller.js";


const router = express.Router();

// Routes
router.post("/create/", createProject);
router.get("/getAll", getProjects);
router.get("/get/:id", getProjectById);
router.patch("/update/:id", updateProject);
router.delete("/delete/:id", deleteProject);

export default router; // Ensure this is exported correctly
