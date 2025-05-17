import { Op } from "sequelize";
import { models } from "../../models/index.js"; // Correct import
import XLSX from "xlsx";
import { processProjectRow } from "../../utils/HelperFunctions/processProjectRow.js";
const {
  Partner,
  Project_Master,
  RevenueMaster,
  Equipment,
  Employee,
  Store,
  EquipmentProject,
  ProjectEmployees,
  ProjectRevenue,
  StoreProject,
} = models; // Extract Partner model

// Create Project

export const createProject = async (req, res) => {
  const {
    projectNo,
    customer,
    orderNo,
    contractStartDate,
    contractTenure,
    revenueMaster,
    equipments,
    staff,
    storeLocations,
  } = req.body;

  const project_no = projectNo;
  const customer_id = customer;
  const order_no = orderNo;
  const contract_start_date = contractStartDate;
  const contract_tenure = contractTenure;
  const revenue_master_ids = revenueMaster;
  const equipment_allocated_ids = equipments;
  const store_location_ids = storeLocations;
  const staff_ids = staff; // renamed for clarity

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
    // 5. Validate employee IDs (staff is a combined array)
    if (staff_ids?.length) {
      const validEmployeeCount = await Employee.count({
        where: { id: { [Op.in]: staff_ids } },
      });

      if (validEmployeeCount !== staff_ids.length) {
        return res
          .status(400)
          .json({ message: "One or more employee IDs are invalid." });
      }
    }
    const allEmployeeIds = staff_ids || [];
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

    // 9. Create ProjectRevenue rows
    if (revenue_master_ids?.length) {
      await ProjectRevenue.bulkCreate(
        revenue_master_ids.map((id) => ({ project_id, revenue_master_id: id }))
      );
    }

    // 10. Create ProjectEmployees rows
    if (staff_ids?.length) {
      await ProjectEmployees.bulkCreate(
        staff_ids.map((employee_id) => ({ project_id, emp_id: employee_id }))
      );
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
// Get all Projects with all associated data
export const getProjects = async (req, res) => {
  try {
    const projects = await Project_Master.findAll({
      include: [
        {
          association: "customer", // Partner model
          attributes: ["id", "partner_name"],
        },
        {
          association: "equipments", // Equipment model
          attributes: ["id", "equipment_name"],
          through: { attributes: [] }, // exclude junction table data
        },
        {
          association: "staff", // Employee model
          attributes: ["id", "emp_name"],
          through: { attributes: [] },
        },
        {
          association: "revenues", // RevenueMaster model
          attributes: ["id", "revenue_code", "revenue_description"],
          through: { attributes: [] },
        },
        {
          association: "store_locations", // StoreLocation model
          attributes: ["id", "store_code", "store_name"],
          through: { attributes: [] },
        },
      ],
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

//Bulk upload
// Controller to handle upload and processing
export const bulkUploadProjects = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Parse uploaded Excel file from buffer
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Get rows as arrays (header: 1)
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (!rows.length) {
      return res.status(400).json({ message: "Excel sheet is empty" });
    }

    // Skip header row if first cell starts with "PRJ-"
    let dataRows = rows.slice(1); // This skips the first row (the header)
   


    const results = [];

    // Process each row
    for (const row of dataRows) {
      // Destructure row data
      const [
        projectNo,
        customer,
        orderNo,
        contractStartDate,
        contractTenure,
        revenuemasterStr,
        equipmentsStr,
        staffStr,
        storelocationsStr,
      ] = row;

      if (!projectNo) continue; // skip empty row

      // Convert comma-separated strings to arrays (trim spaces)
      const revenue_master_ids = revenuemasterStr
        ? revenuemasterStr.split(",").map((r) => r.trim())
        : [];
      const equipment_allocated_ids = equipmentsStr
        ? equipmentsStr.split(",").map((e) => e.trim())
        : [];
      const staff_ids = staffStr
        ? staffStr.split(",").map((s) => s.trim())
        : [];
      const store_location_ids = storelocationsStr
        ? storelocationsStr.split(",").map((s) => s.trim())
        : [];

        console.log({customer})
      // Process one project row and push results
      const result = await processProjectRow({
        projectNo,
        customer,
        orderNo,
        contractStartDate,
        contractTenure,
        revenue_master_ids,
        equipment_allocated_ids,
        staff_ids,
        store_location_ids,
      });

      results.push(result);
    }

    return res.status(201).json({
      message: "Bulk upload completed",
      results,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
