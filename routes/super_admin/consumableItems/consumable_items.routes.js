import express from "express";
import {
  createConsumableItem,
  getAllConsumableItems,
  getConsumableItemById,
  updateConsumableItem,
  deleteConsumableItem,
} from "../../../controllers/consumerableItems/consumable_items.controller.js";

const router = express.Router();

router.post("/", createConsumableItem);
router.get("/", getAllConsumableItems);
router.get("/:id", getConsumableItemById);
router.put("/:id", updateConsumableItem);
router.delete("/:id", deleteConsumableItem);

export default router;
