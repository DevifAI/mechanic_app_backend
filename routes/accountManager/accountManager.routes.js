import express from "express";

import {
  createDailyExpense,
  createDieselInvoice,
  createMaterialBill,
  createRevenueInput,
  deleteDieselInvoice,
  getAllRevenueInputInvoices,
  getBillsByProject,
  getBillsByProjectAndUser,
  getDraft,
  getExpensesByCreator,
  getHOInvoicesByProjectAndUser,
  getInvoiced,
  getInvoicesByProjectId,
  getInvoicesByStatus,
  getRejected,
  getSubmittedDieselInvoices,
  updateDieselInvoice,
} from "../../controllers/account_manager/material_bill.controller.js";

const router = express.Router();

router.post("/create/material/bill", createMaterialBill);
router.post("/get/material/bill/creator", getBillsByProjectAndUser);
router.post("/get/material/bill/by/project", getBillsByProject);
router.post("/create/expense/input", createDailyExpense);
router.post("/get/expense/input/creator", getExpensesByCreator);
router.post("/create/revenue/input", createRevenueInput);
router.post("/get/revenue/input", getAllRevenueInputInvoices);
router.post("/get/revenue/input/creator", getHOInvoicesByProjectAndUser);
router.post("/diesel-invoice", createDieselInvoice);
router.post("/diesel-invoice/submitted", getSubmittedDieselInvoices);
router.post("/diesel-invoice/all", getInvoicesByProjectId);
router.get("/diesel-invoice/status/:status", getInvoicesByStatus);
router.put("/diesel-invoice/:id", updateDieselInvoice);
router.delete("/diesel-invoice/:id", deleteDieselInvoice);
router.delete("/material-bill/draft", getDraft);
router.delete("/material-bill/invoiced", getInvoiced);
router.delete("/material-bill/rejected", getRejected);

export default router;
