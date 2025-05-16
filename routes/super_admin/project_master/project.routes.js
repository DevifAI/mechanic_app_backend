import express from "express";
import { createProject, deleteProject, getProjectById, getProjects, updateProject } from "../../../controllers/project_master/project_master.controller.js";


const router = express.Router();

// Routes
router.post("/create/project", createProject);
router.get("/projects", getProjects);
router.get("/project/:id", getProjectById);
router.post("/project/:id", updateProject);
router.delete("/partners/:id", deleteProject);

export default router; // Ensure this is exported correctly
