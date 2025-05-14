import express from "express";
import dotenv from "dotenv";

import { connection } from "./config/postgres.js"; // Import syncModels
import partnerRoutes from "./routes/super_admin/partner/index.js"; // Correct path for partner routes
import { syncModels } from "./models/index.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies
// Use partner routes
app.use("/api/master/super/admin", partnerRoutes);

// Initialize database connection
connection();

// Sync models
syncModels(); // Ensure models are synced before starting the server

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
