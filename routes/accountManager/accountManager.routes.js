import express from "express";

import {
  createDailyExpense,
  createMaterialBill,
  createRevenueInput,
  getAllRevenueInputInvoices,
  getBillsByProjectAndUser,
  getExpensesByCreator,
  getHOInvoicesByProjectAndUser,
} from "../../controllers/account_manager/material_bill.controller.js";

const router = express.Router();

router.post("/create/material/bill", createMaterialBill);
router.post("/get/material/bill/creator", getBillsByProjectAndUser);
router.post("/create/expense/input", createDailyExpense);
router.post("/get/expense/input/creator", getExpensesByCreator);
router.post("/create/revenue/input", createRevenueInput);
router.post("/get/revenue/input", getAllRevenueInputInvoices);
router.post("/get/revenue/input/creator", getHOInvoicesByProjectAndUser);

export default router;
