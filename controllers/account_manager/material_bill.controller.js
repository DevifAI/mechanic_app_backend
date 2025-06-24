import { models } from "../../models/index.js";
const {
  MaterialBillTransaction,
  MaterialBillTransactionForm,
  ExpenseInput,
  RevenueInput,
  Employee,
  Project_Master,
} = models;

// ✅ Create Material Bill
export const createMaterialBill = async (req, res) => {
  try {
    const {
      project_id,
      date,
      createdBy,
      partner,
      partner_inv_no,
      inv_basic_value,
      inv_tax,
      total_invoice_value,
      forms,
    } = req.body;

    const bill = await MaterialBillTransaction.create({
      project_id,
      date,
      createdBy,
      partner,
      partner_inv_no,
      inv_basic_value,
      inv_tax,
      total_invoice_value,
    });

    if (Array.isArray(forms) && forms.length > 0) {
      const formData = forms.map((item) => ({
        material_transaction_id: bill.id,
        item: item.item,
        qty: item.qty,
        uom: item.uom,
        notes: item.notes || null,
      }));

      await MaterialBillTransactionForm.bulkCreate(formData);
    }

    return res.status(201).json({ message: "Material bill created", bill });
  } catch (error) {
    console.error("Create Material Bill Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllMaterialBills = async (req, res) => {
  try {
    const bills = await MaterialBillTransaction.findAll({
      include: [
        {
          model: models.Project_Master,
          as: "project",
          attributes: ["id", "project_name"],
        },
        {
          model: models.Partner,
          as: "partnerDetails",
          attributes: ["id", "partner_name", "partner_address"],
        },
        {
          model: models.Employee,
          as: "createdByUser",
          attributes: ["id", "emp_id", "emp_name"],
        },
        {
          model: models.MaterialBillTransactionForm,
          as: "formItems",
          include: [
            {
              model: models.ConsumableItem,
              as: "consumableItem",
              attributes: ["id", "item_name", "item_code"],
            },
            {
              model: models.UOM,
              as: "unitOfMeasure",
              attributes: ["id", "unit_name", "unit_code"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(bills);
  } catch (error) {
    console.error("Get All Bills Error:", error);
    return res.status(500).json({ message: "Failed to fetch material bills" });
  }
};

export const getBillsByProjectAndUser = async (req, res) => {
  try {
    const { project_id, createdBy } = req.body;

    const bills = await MaterialBillTransaction.findAll({
      where: { project_id, createdBy },
      include: [
        {
          model: models.MaterialBillTransactionForm,
          as: "formItems",
          include: [
            {
              model: models.ConsumableItem,
              as: "consumableItem",
              attributes: ["id", "item_name"],
            },
            {
              model: models.UOM,
              as: "unitOfMeasure",
              attributes: ["id", "unit_name"],
            },
          ],
        },
      ],
    });

    return res.status(200).json(bills);
  } catch (error) {
    console.error("Filter Bills Error:", error);
    return res.status(500).json({ message: "Failed to filter material bills" });
  }
};

export const updateMaterialBill = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      project_id,
      date,
      createdBy,
      partner,
      partner_inv_no,
      inv_basic_value,
      inv_tax,
      total_invoice_value,
      forms,
    } = req.body;

    const bill = await MaterialBillTransaction.findByPk(id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    await bill.update({
      project_id,
      date,
      createdBy,
      partner,
      partner_inv_no,
      inv_basic_value,
      inv_tax,
      total_invoice_value,
    });

    if (Array.isArray(forms)) {
      // Delete old items
      await MaterialBillTransactionForm.destroy({
        where: { material_transaction_id: id },
      });

      // Insert new form items
      const formData = forms.map((item) => ({
        material_transaction_id: id,
        item: item.item,
        qty: item.qty,
        uom: item.uom,
        notes: item.notes || null,
      }));

      await MaterialBillTransactionForm.bulkCreate(formData);
    }

    return res.status(200).json({ message: "Bill updated successfully" });
  } catch (error) {
    console.error("Update Bill Error:", error);
    return res.status(500).json({ message: "Failed to update bill" });
  }
};

export const deleteMaterialBill = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await MaterialBillTransaction.findByPk(id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    // Delete form items first
    await MaterialBillTransactionForm.destroy({
      where: { material_transaction_id: id },
    });

    // Delete the bill
    await bill.destroy();

    return res.status(200).json({ message: "Bill deleted successfully" });
  } catch (error) {
    console.error("Delete Bill Error:", error);
    return res.status(500).json({ message: "Failed to delete bill" });
  }
};

// ExpenseInput

export const createDailyExpense = async (req, res) => {
  try {
    const {
      project_id,
      date,
      paid_to,
      paid_by,
      expense_code,
      expense_name,
      amount,
      allocation,
      notes,
      createdBy,
    } = req.body;

    const expense = await ExpenseInput.create({
      project_id,
      date,
      paid_to,
      paid_by,
      expense_code,
      expense_name,
      amount,
      allocation,
      notes,
      createdBy,
    });

    res.status(201).json({ message: "Expense created successfully", expense });
  } catch (error) {
    console.error("Create Expense Error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const getAllDailyExpenses = async (req, res) => {
  try {
    const expenses = await DailyExpense.findAll({
      include: [
        {
          model: Employee,
          as: "creator",
          attributes: ["id", "emp_name", "emp_id"],
        },
      ],
      order: [["date", "DESC"]],
    });

    res.status(200).json(expenses);
  } catch (error) {
    console.error("Fetch All Expenses Error:", error);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};

export const getExpensesByCreator = async (req, res) => {
  try {
    const { createdBy, project_id } = req.body;

    const where = { createdBy };
    if (project_id) where.project_id = project_id;

    const expenses = await ExpenseInput.findAll({
      where,
      include: [
        {
          model: Employee,
          as: "creator",
        },
        {
          model: Project_Master,
          as: "project",
        },
      ],
      order: [["date", "DESC"]],
    });

    res.status(200).json(expenses);
  } catch (error) {
    console.error("Filter Expenses Error:", error);
    res.status(500).json({ message: "Failed to filter expenses" });
  }
};

export const deleteDailyExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await DailyExpense.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({ message: "Expense deleted" });
  } catch (error) {
    console.error("Delete Expense Error:", error);
    res.status(500).json({ message: "Failed to delete expense" });
  }
};

// revenue input

export const createRevenueInput = async (req, res) => {
  try {
    const {
      project_id,
      createdBy,
      date,
      ho_invoice,
      account_code,
      account_name,
      amount_basic,
      tax_value,
      total_amount,
    } = req.body;

    const invoice = await RevenueInput.create({
      project_id,
      createdBy,
      date,
      ho_invoice,
      account_code,
      account_name,
      amount_basic,
      tax_value,
      total_amount,
    });

    res.status(201).json({ message: "Invoice created successfully", invoice });
  } catch (error) {
    console.error("Create HO Invoice Error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const getAllRevenueInputInvoices = async (req, res) => {
  try {
    const invoices = await HOInvoiceInput.findAll({
      include: [
        {
          model: Employee,
          as: "creator",
          attributes: ["id", "emp_name", "emp_id"],
        },
        {
          model: Project_Master,
          as: "project",
          attributes: ["id", "project_name", "project_code"],
        },
      ],
      order: [["date", "DESC"]],
    });

    res.status(200).json(invoices);
  } catch (error) {
    console.error("Get All HO Invoices Error:", error);
    res.status(500).json({ message: "Failed to fetch HO invoices" });
  }
};

export const getHOInvoicesByProjectAndUser = async (req, res) => {
  try {
    const { project_id, createdBy } = req.body;

    const invoices = await RevenueInput.findAll({
      where: { project_id, createdBy },
      include: [
        {
          model: Employee,
          as: "creator",
       
        },
        {
          model: Project_Master,
          as: "project",
     
        },
      ],
      order: [["date", "DESC"]],
    });

    res.status(200).json(invoices);
  } catch (error) {
    console.error("Filter HO Invoices Error:", error);
    res.status(500).json({ message: "Failed to filter HO invoices" });
  }
};
