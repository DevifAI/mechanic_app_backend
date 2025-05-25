import express from "express";
import {
  createAccount,
  getAllAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
} from "../../../controllers/account/account.controller.js";

const router = express.Router();

router.post("/", createAccount);
router.get("/", getAllAccounts);
router.get("/:id", getAccountById);
router.put("/:id", updateAccount);
router.delete("/:id", deleteAccount);

export default router;
