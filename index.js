import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { connection } from "./config/postgres.js"; // Import syncModels
import projectsRoutes from "./routes/super_admin/project_master/project.routes.js";
import partnerRoutes from "./routes/super_admin/partner/index.js";
import job_masterRoutes from "./routes/super_admin/job_master/job_master.routes.js";
import revenueRoutes from "./routes/super_admin/revenue/revenue.routes.js";
import equipmentGroupRoutes from "./routes/super_admin/equipmentGroup/equipmentGroup.routes.js";
import equipmentRoutes from "./routes/super_admin/equipment/equioment.routes.js";
import roleRoutes from "./routes/super_admin/role/role.routes.js";
import shiftRoutes from "./routes/super_admin/shift/shift.routes.js";
import empPositionRoutes from "./routes/super_admin/empPosition/empPosition.routes.js";
import employeeRoutes from "./routes/super_admin/employee/employee.routes.js";
import storeRoutes from "./routes/super_admin/store/store.routes.js"; // Import store routes
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
app.use("/api/master/super/admin/role", roleRoutes);
app.use("/api/master/super/admin/shift", shiftRoutes);
app.use("/api/master/super/admin/empPosition", empPositionRoutes);
app.use("/api/master/super/admin/employee", employeeRoutes);
app.use("/api/master/super/admin/store", storeRoutes);

// Initialize database connection
connection();

// Sync models
syncModels(); // Ensure models are synced before starting the server

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
