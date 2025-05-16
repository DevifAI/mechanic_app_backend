import express from "express";
import {
  createRevenue,
  getAllRevenues,
  getRevenueById,
  updateRevenue,
  deleteRevenue,
} from "../../../controllers/revenue/revenue_master.controller.js";

const router = express.Router();

router.post("/create", createRevenue);
router.get("/getAll", getAllRevenues);
router.get("/get/:id", getRevenueById);
router.patch("/update/:id", updateRevenue);
router.delete("/delete/:id", deleteRevenue);

export default router;
