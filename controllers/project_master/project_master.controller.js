import { models } from "../../models/index.js"; // Correct import
const { Partner, ProjectMaster } = models; // Extract Partner model

// Create Project
export const createProject = async (req, res) => {
  const {
    project_no,
    customer_id,
    order_no,
    contract_tenure,
    contract_start_date,
    asset_allocated_ids,
    revenue_master_ids, // <-- Accept as array
    site_mechanic_ids,
    site_supervisor_ids,
    site_manager_ids,
    site_store_manager_ids,
    store_location_ids,
  } = req.body;

  try {
    const partner = await Partner.findOne({ where: { id: customer_id } });
    if (!partner || partner.isCustomer !== false) {
      return res.status(400).json({
        message:
          "Invalid customer_id: Must reference a partner where isCustomer is false.",
      });
    }

    const project = await ProjectMaster.create({
      project_no,
      customer_id,
      order_no,
      contract_tenure,
      contract_start_date,
      asset_allocated_ids,
      site_mechanic_ids,
      site_supervisor_ids,
      site_manager_ids,
      site_store_manager_ids,
      store_location_ids,
    });

    // Set revenues if provided
    if (Array.isArray(revenue_master_ids)) {
      await project.setRevenues(revenue_master_ids);
    }

    // Optionally, reload with associations
    const result = await ProjectMaster.findByPk(project.id, {
      include: [{ association: "revenues" }],
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error("Error creating project:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all Projects (with revenues)
export const getProjects = async (req, res) => {
  try {
    const projects = await ProjectMaster.findAll({
      include: [{ association: "revenues" }],
    });
    return res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Project by ID (with revenues)
export const getProjectById = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await ProjectMaster.findByPk(id, {
      include: [{ association: "revenues" }],
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    return res.status(200).json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Project
export const updateProject = async (req, res) => {
  const { id } = req.params;
  const {
    project_no,
    customer_id,
    order_no,
    contract_tenure,
    contract_start_date,
    asset_allocated_ids,
    revenue_master_ids, // <-- Accept as array
    site_mechanic_ids,
    site_supervisor_ids,
    site_manager_ids,
    site_store_manager_ids,
    store_location_ids,
  } = req.body;

  try {
    const partner = await Partner.findOne({ where: { id: customer_id } });
    if (!partner || partner.isCustomer !== false) {
      return res.status(400).json({
        message:
          "Invalid customer_id: Must reference a partner where isCustomer is false.",
      });
    }

    const project = await ProjectMaster.findByPk(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await project.update({
      project_no,
      customer_id,
      order_no,
      contract_tenure,
      contract_start_date,
      asset_allocated_ids,
      site_mechanic_ids,
      site_supervisor_ids,
      site_manager_ids,
      site_store_manager_ids,
      store_location_ids,
    });

    // Update revenues if provided
    if (Array.isArray(revenue_master_ids)) {
      await project.setRevenues(revenue_master_ids);
    }

    // Optionally, reload with associations
    const result = await ProjectMaster.findByPk(project.id, {
      include: [{ association: "revenues" }],
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error updating project:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Project
export const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await ProjectMaster.findByPk(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await project.destroy();
    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
