import express from "express";
import { createRevenue, deleteRevenue, getRevenueById, getRevenues, updateRevenue } from "../../../controllers/revenue/revenue_master.controller.js";

const router = express.Router();

router.post("/", createRevenue);
router.get("/", getRevenues);
router.get("/:id", getRevenueById);
router.put("/:id", updateRevenue);
router.delete("/:id", deleteRevenue);

export default router;
