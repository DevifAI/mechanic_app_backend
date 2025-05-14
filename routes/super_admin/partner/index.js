import express from "express";
import {
  createPartner,
  deletePartner,
  getPartners,
  updatePartner,
} from "../../../controllers/partner/partner.controller.js"; // Adjust path as necessary

const router = express.Router();

// Routes
router.post("/create/partner", createPartner);
router.get("/getpartners", getPartners);
router.post("/partners/:id", updatePartner);
router.delete("/partners/:id", deletePartner);

export default router; // Ensure this is exported correctly
