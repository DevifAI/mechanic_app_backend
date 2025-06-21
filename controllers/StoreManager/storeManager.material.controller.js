import { models } from "../../models/index.js";

const { MaterialTransaction, MaterialTransactionForm, Partner } = models;
// CREATE
export const createMaterialTransaction = async (req, res) => {
  try {
    const {
      date,
      data_type,
      type,
      partner,
      challan_no,
      formItems,
      project_id,
    } = req.body;

    const transaction = await MaterialTransaction.create({
      date,
      data_type,
      type,
      partner,
      challan_no,
      project_id,
    });

    if (Array.isArray(formItems) && formItems.length > 0) {
      const formEntries = formItems.map((item) => ({
        ...item,
        material_transaction_id: transaction.id,
      }));
      await MaterialTransactionForm.bulkCreate(formEntries);
    }

    res
      .status(201)
      .json({ message: "Material Transaction created", transaction });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// READ ALL
export const getAllMaterialTransactions = async (req, res) => {
  try {
    const { data_type } = req.body;

    // Validate input (optional)
    if (!["material_in", "material_out"].includes(data_type)) {
      return res.status(400).json({ error: "Invalid data_type" });
    }

    const transactions = await MaterialTransaction.findAll({
      where: { data_type },
      include: [
        {
          model: Partner,
          as: "partnerDetails",
        },
        {
          model: MaterialTransactionForm,
          as: "formItems",
        },
      ],
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// READ ONE
export const getMaterialTransactionById = async (req, res) => {
  try {
    const transaction = await MaterialTransaction.findByPk(req.params.id, {
      include: [
        { model: db.Partner, as: "partnerDetails" },
        { model: db.MaterialTransactionsForm, as: "formItems" },
      ],
    });

    if (!transaction) return res.status(404).json({ message: "Not found" });

    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// UPDATE
export const updateMaterialTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, data_type, type, partner, challan_no, formItems } = req.body;

    const transaction = await MaterialTransaction.findByPk(id);
    if (!transaction) return res.status(404).json({ message: "Not found" });

    await transaction.update({ date, data_type, type, partner, challan_no });

    if (Array.isArray(formItems)) {
      // Delete old items and add new
      await MaterialTransactionForm.destroy({
        where: { material_transaction_id: id },
      });
      const newFormItems = formItems.map((item) => ({
        ...item,
        material_transaction_id: id,
      }));
      await MaterialTransactionForm.bulkCreate(newFormItems);
    }

    res.status(200).json({ message: "Transaction updated", transaction });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE
export const deleteMaterialTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    await MaterialTransactionForm.destroy({
      where: { material_transaction_id: id },
    });
    const deleted = await MaterialTransaction.destroy({ where: { id } });

    if (!deleted) return res.status(404).json({ message: "Not found" });

    res.status(200).json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
