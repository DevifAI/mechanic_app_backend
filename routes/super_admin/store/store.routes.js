import express from "express";
import {
  createStore,
  getStores,
  getStoreById,
  updateStore,
  deleteStore,
} from "../../../controllers/store/store.controller.js"; // Adjust path if needed

const router = express.Router();

// POST /store/create
router.post("/create", createStore);

// GET /store/getAll
router.get("/getAll", getStores);

// GET /store/get/:id
router.get("/get/:id", getStoreById);

// PUT /store/update/:id
router.put("/update/:id", updateStore);

// DELETE /store/delete/:id
router.delete("/delete/:id", deleteStore);

export default router;
