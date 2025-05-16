import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { connection } from "./config/postgres.js"; // Import syncModels
import projectsRoutes from "./routes/super_admin/project_master/project.routes.js";
import partnerRoutes from "./routes/super_admin/partner/index.js";
import job_masterRoutes from "./routes/super_admin/job_master/job_master.routes.js";
import revenueRoutes from "./routes/super_admin/revenue/revenue.routes.js";
import equipmentGroupRoutes from "./routes/super_admin/equipmentGroup/equipmentGroup.model.js";
import equipmentRoutes from "./routes/super_admin/equipment/equioment.routes.js";
import { syncModels } from "./models/index.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for all routes
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies
// Use partner routes
app.use("/api/master/super/admin/project", projectsRoutes);
app.use("/api/master/super/admin/partner", partnerRoutes);
app.use("/api/master/super/admin/job_master", job_masterRoutes);
app.use("/api/master/super/admin/revenue_master", revenueRoutes);
app.use("/api/master/super/admin/equipmentGroup", equipmentGroupRoutes);
app.use("/api/master/super/admin/equipment", equipmentRoutes);

// Initialize database connection
connection();

// Sync models
syncModels(); // Ensure models are synced before starting the server

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
