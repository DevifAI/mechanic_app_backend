import { models } from "../../models/index.js"; 
const { Organisations } = models;

// Create an Organisation
export const createOrganisation = async (req, res) => {
  const { org_name, org_code } = req.body;

  try {
    // Check if organisation with same org_code exists
    const existingOrg = await Organisations.findOne({ where: { org_code } });

    if (existingOrg) {
      return res.status(400).json({ message: "Organisation with this org_code already exists" });
    }

    // Create new organisation
    const organisation = await Organisations.create({ org_name, org_code });
    return res.status(201).json(organisation);
  } catch (error) {
    console.error("Error creating organisation:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// Get All Organisations
export const getOrganisations = async (req, res) => {
  try {
    const organisations = await Organisations.findAll();
    return res.status(200).json(organisations);
  } catch (error) {
    console.error("Error fetching organisations:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Organisation by ID
export const getOrganisationById = async (req, res) => {
  const { id } = req.params;

  try {
    const organisation = await Organisations.findByPk(id);
    if (!organisation) {
      return res.status(404).json({ message: "Organisation not found" });
    }
    return res.status(200).json(organisation);
  } catch (error) {
    console.error("Error fetching organisation:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Organisation
export const updateOrganisation = async (req, res) => {
  const { id } = req.params;
  const { org_name, org_code } = req.body;

  try {
    const organisation = await Organisations.findByPk(id);
    if (!organisation) {
      return res.status(404).json({ message: "Organisation not found" });
    }

    await organisation.update({ org_name, org_code });
    return res.status(200).json(organisation);
  } catch (error) {
    console.error("Error updating organisation:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Organisation
export const deleteOrganisation = async (req, res) => {
  const { id } = req.params;

  try {
    const organisation = await Organisations.findByPk(id);
    if (!organisation) {
      return res.status(404).json({ message: "Organisation not found" });
    }

    await organisation.destroy();
    return res.status(200).json({ message: "Organisation deleted successfully" });
  } catch (error) {
    console.error("Error deleting organisation:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
