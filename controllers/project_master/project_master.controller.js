import { Op } from "sequelize";
import { models } from "../../models/index.js"; // Correct import
const {
  Partner,
  Project_Master,
  RevenueMaster,
  Equipment,
  Employee,
  Store,
  EquipmentProject,
  ProjectEmployees,
  RevenueProject,
  StoreProject,
} = models; // Extract Partner model

// Create Project

export const createProject = async (req, res) => {
  const {
    project_no,
    customer_id,
    order_no,
    contract_tenure,
    contract_start_date,
    equipment_allocated_ids,
    revenue_master_ids,
    mechanic_ids,
    mechanic_incharge_ids,
    site_incharge_ids,
    site_manager_ids,
    store_manager_ids,
    store_location_ids,
  } = req.body;

  try {
    // 1. Duplicate project check
    const existingProject = await Project_Master.findOne({
      where: { project_no },
    });
    if (existingProject) {
      return res
        .status(400)
        .json({ message: "Project number already exists." });
    }

    // 2. Validate customer
    const partner = await Partner.findOne({ where: { id: customer_id } });
    if (!partner)
      return res.status(400).json({ message: "Invalid customer_id" });

    // 3. Validate revenue_master_ids
    if (revenue_master_ids?.length) {
      const validRevenueCount = await RevenueMaster.count({
        where: { id: { [Op.in]: revenue_master_ids } },
      });
      if (validRevenueCount !== revenue_master_ids.length)
        return res.status(400).json({ message: "Invalid revenue provided." });
    }

    // 4. Validate equipment_allocated_ids
    if (equipment_allocated_ids?.length) {
      const validEquipments = await Equipment.count({
        where: { id: { [Op.in]: equipment_allocated_ids } },
      });
      if (validEquipments !== equipment_allocated_ids.length)
        return res.status(400).json({ message: "Invalid equipment provided." });
    }

    // 5. Validate employee IDs
    const allEmployeeIds = [
      ...(mechanic_ids || []),
      ...(mechanic_incharge_ids || []),
      ...(site_incharge_ids || []),
      ...(site_manager_ids || []),
      ...(store_manager_ids || []),
    ];
    if (allEmployeeIds.length > 0) {
      const validEmployeeCount = await Employee.count({
        where: { id: { [Op.in]: allEmployeeIds } },
      });
      if (validEmployeeCount !== allEmployeeIds.length)
        return res
          .status(400)
          .json({ message: "One or more site employee IDs are invalid." });
    }

    // 6. Validate store_location_ids
    if (store_location_ids?.length) {
      const validStoreCount = await Store.count({
        where: { id: { [Op.in]: store_location_ids } },
      });
      if (validStoreCount !== store_location_ids.length)
        return res
          .status(400)
          .json({ message: "Invalid store location provided." });
    }

    // 7. Create project
    const project = await Project_Master.create({
      project_no,
      customer_id,
      order_no,
      contract_tenure,
      contract_start_date,
    });

    const project_id = project.id;

    // 8. Create EquipmentProject rows
    if (equipment_allocated_ids?.length) {
      await EquipmentProject.bulkCreate(
        equipment_allocated_ids.map((id) => ({ project_id, equipment_id: id }))
      );
    }

    // 9. Create RevenueProject rows
    if (revenue_master_ids?.length) {
      await RevenueProject.bulkCreate(
        revenue_master_ids.map((id) => ({ project_id, revenue_id: id }))
      );
    }

    // 10. Create ProjectEmployees rows
    const employeeMap = [
      { ids: mechanic_ids, },
      { ids: mechanic_incharge_ids,  },
      { ids: site_incharge_ids,  },
      { ids: site_manager_ids, },
      { ids: store_manager_ids, },
    ];

    for (const { ids } of employeeMap) {
      if (ids?.length) {
        await ProjectEmployees.bulkCreate(
          ids.map((employee_id) => ({ project_id, employee_id }))
        );
      }
    }

    // 11. Create StoreProject rows
    if (store_location_ids?.length) {
      await StoreProject.bulkCreate(
        store_location_ids.map((store_id) => ({ project_id, store_id }))
      );
    }

    return res
      .status(201)
      .json({ message: "Project created successfully", project });
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
