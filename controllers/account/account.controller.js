import { models } from "../../models/index.js";
const { Account, AccountGroup } = models;

export const createAccount = async (req, res) => {
  try {
    const account = await Account.create(req.body);
    res.status(201).json(account);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.findAll({
      include: {
        model: models.AccountGroup,
        as: "group", // This alias must match the alias in Account.associate
        attributes: ["id", "account_group_name", "account_group_code"], // optional, to limit returned fields
      },
    });

    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAccountById = async (req, res) => {
  try {
    const account = await Account.findByPk(req.params.id, {
      include: [
        {
          association: "group", // This must match the alias used in Account.belongsTo
        },
      ],
    });

    if (!account) return res.status(404).json({ error: "Account not found" });

    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAccount = async (req, res) => {
  try {
    const account = await Account.findByPk(req.params.id);
    if (!account) return res.status(404).json({ error: "Account not found" });

    await account.update(req.body);
    res.status(200).json(account);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const account = await Account.findByPk(req.params.id);
    if (!account) return res.status(404).json({ error: "Account not found" });

    await account.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
