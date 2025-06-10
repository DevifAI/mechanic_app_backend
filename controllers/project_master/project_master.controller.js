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
  Role
} = models; // Extract Partner model

// Create Project


export const createProject = async (req, res) => {
  const {
    projectNo,
    customer,
    orderNo,
    contractStartDate,
    contractTenure,
    contractEndDate, // ✅ New field
    revenueMaster = [],
    equipments = [],
    staff = [],
    storeLocations = [],
  } = req.body;

  try {
    // Validate required relationships
    if (!equipments.length) {
      return res.status(400).json({ message: "At least one equipment is required." });
    }
    if (staff.length < 6) {
      return res.status(400).json({ message: "Minimum 6 staff members are required." });
    }
    if (!storeLocations.length) {
      return res.status(400).json({ message: "At least one store location is required." });
    }
    if (!revenueMaster.length) {
      return res.status(400).json({ message: "At least one revenue master is required." });
    }

    // Check if project number already exists
    const existingProject = await Project_Master.findOne({
      where: { project_no: projectNo },
    });

    if (existingProject) {
      return res.status(400).json({ message: "Project number already exists." });
    }

    // Validate customer_id
    const customerExists = await Partner.findByPk(customer);
    if (!customerExists) {
      return res.status(400).json({ message: "Invalid customer ID." });
    }

    // Required roles
    const requiredRoles = [
      'mechanic',
      'mechanicIncharge',
      'siteIncharge',
      'storeManager',
      'accountManager',
      'ProjectManager'
    ];

    const staffDetails = await Employee.findAll({
      where: { id: { [Op.in]: staff } },
      include: [{
        model: Role,
        as: 'role',
        attributes: ['name']
      }]
    });

    if (staffDetails.length !== staff.length) {
      return res.status(400).json({ message: "Invalid employee/staff ID(s)." });
    }

    const presentRoles = [...new Set(staffDetails.map(emp => emp.role?.name))];
    const missingRoles = requiredRoles.filter(role => !presentRoles.includes(role));

    if (missingRoles.length > 0) {
      return res.status(400).json({
        message: `Missing required staff roles: ${missingRoles.join(', ')}. Each of these roles must have at least one staff member assigned.`
      });
    }

    // Validate related entities
    const validRevenueCount = await RevenueMaster.count({ where: { id: { [Op.in]: revenueMaster } } });
    if (validRevenueCount !== revenueMaster.length) {
      return res.status(400).json({ message: "Invalid revenue master ID(s)." });
    }

    const validEquipmentCount = await Equipment.count({ where: { id: { [Op.in]: equipments } } });
    if (validEquipmentCount !== equipments.length) {
      return res.status(400).json({ message: "Invalid equipment ID(s)." });
    }

    const validStoreCount = await Store.count({ where: { id: { [Op.in]: storeLocations } } });
    if (validStoreCount !== storeLocations.length) {
      return res.status(400).json({ message: "Invalid store location ID(s)." });
    }

    // ✅ Default today's date if not provided
    const endDate = contractEndDate ? new Date(contractEndDate) : new Date();

    // Create project
    const project = await Project_Master.create({
      project_no: projectNo,
      customer_id: customer,
      order_no: orderNo,
      contract_start_date: contractStartDate,
      contract_end_date: endDate, // ✅ Added here
      contract_tenure: contractTenure,
    });

    const project_id = project.id;

    await EquipmentProject.bulkCreate(
      equipments.map((equipment_id) => ({ project_id, equipment_id }))
    );

    await ProjectRevenue.bulkCreate(
      revenueMaster.map((revenue_master_id) => ({ project_id, revenue_master_id }))
    );

    await ProjectEmployees.bulkCreate(
      staff.map((emp_id) => ({ project_id, emp_id }))
    );

    await StoreProject.bulkCreate(
      storeLocations.map((store_id) => ({ project_id, store_id }))
    );

    return res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Error in createProject:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// Get all Projects with all associated data
export const getProjects = async (req, res) => {
  try {
    const projects = await Project_Master.findAll({
      include: [
        {
          association: "customer",
          attributes: ["id", "partner_name"],
        },
        {
          association: "equipments",
          attributes: ["id", "equipment_name"],
          through: { attributes: [] },
        },
        {
          association: "staff",
          attributes: ["id", "emp_name"],
          through: { attributes: [] },
        },
        {
          association: "revenues",
          attributes: ["id", "revenue_code", "revenue_description"],
          through: { attributes: [] },
        },
        {
          association: "store_locations",
          attributes: ["id", "store_code", "store_name"],
          through: { attributes: [] },
        },
      ],
    });

    const projectsWithDuration = projects.map((project) => {
      const start = new Date(project.contract_start_date);
      const end = new Date(project.contract_end_date);
      const duration = `${Math.ceil((end - start) / (1000 * 60 * 60 * 24))} Days`; // in days

      return {
        ...project.toJSON(),
        contract_end_date: project.contract_end_date,
        duration,
      };
    });

    return res.status(200).json(projectsWithDuration);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Project by ID (with all associations)
export const getProjectById = async (req, res) => {
  const { id } = req.body;

  try {
    const project = await Project_Master.findByPk(id, {
      include: [
        {
          association: "customer",
          attributes: ["id", "partner_name"],
        },
        {
          association: "equipments",
          attributes: ["id", "equipment_name"],
          through: { attributes: [] },
        },
        {
          association: "staff",
          attributes: ["id", "emp_name", "role_id"],
          through: { attributes: [] },
          include: [
            {
              association: "role",
              attributes: ["name"],
            },
          ],
        },
        {
          association: "revenues",
          attributes: ["id", "revenue_code", "revenue_description"],
          through: { attributes: [] },
        },
        {
          association: "store_locations",
          attributes: ["id", "store_code", "store_name"],
          through: { attributes: [] },
        },
      ],
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const start = new Date(project.contract_start_date);
    const end = new Date(project.contract_end_date);
    const duration = `${Math.ceil((end - start) / (1000 * 60 * 60 * 24))} days`; // duration in days

    return res.status(200).json({
      ...project.toJSON(),
      contract_end_date: project.contract_end_date,
      duration, // number of days between start and end
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};



// Update Project
export const updateProject = async (req, res) => {
  const {
    projectNo,
    customer,
    orderNo,
    contractStartDate,
    contractEndDate, // ← added
    contractTenure,
    revenueMaster = [],
    equipments = [],
    staff = [],
    storeLocations = [],
  } = req.body;

  try {
    const { id } = req.params;
    const project = await Project_Master.findByPk(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (!equipments.length) {
      return res.status(400).json({ message: "At least one equipment is required." });
    }
    if (!staff.length) {
      return res.status(400).json({ message: "At least one staff member is required." });
    }
    if (!storeLocations.length) {
      return res.status(400).json({ message: "At least one store location is required." });
    }
    if (!revenueMaster.length) {
      return res.status(400).json({ message: "At least one revenue master is required." });
    }

    if (project.project_no !== projectNo) {
      const existingProject = await Project_Master.findOne({
        where: { project_no: projectNo },
      });
      if (existingProject) {
        return res.status(400).json({ message: "Project number already exists." });
      }
    }

    const customerExists = await Partner.findByPk(customer);
    if (!customerExists) {
      return res.status(400).json({ message: "Invalid customer ID." });
    }

    const [
      validRevenueCount,
      validEquipmentCount,
      validStaffCount,
      validStoreCount,
    ] = await Promise.all([
      RevenueMaster.count({ where: { id: { [Op.in]: revenueMaster } } }),
      Equipment.count({ where: { id: { [Op.in]: equipments } } }),
      Employee.count({ where: { id: { [Op.in]: staff } } }),
      Store.count({ where: { id: { [Op.in]: storeLocations } } }),
    ]);

    if (validRevenueCount !== revenueMaster.length) {
      return res.status(400).json({ message: "Invalid revenue master ID(s)." });
    }
    if (validEquipmentCount !== equipments.length) {
      return res.status(400).json({ message: "Invalid equipment ID(s)." });
    }
    if (validStaffCount !== staff.length) {
      return res.status(400).json({ message: "Invalid employee/staff ID(s)." });
    }
    if (validStoreCount !== storeLocations.length) {
      return res.status(400).json({ message: "Invalid store location ID(s)." });
    }

    await project.update({
      project_no: projectNo,
      customer_id: customer,
      order_no: orderNo,
      contract_start_date: contractStartDate,
      contract_end_date: contractEndDate, // ← update field
      contract_tenure: contractTenure,
    });

    const project_id = project.id;

    await Promise.all([
      EquipmentProject.destroy({ where: { project_id } }),
      ProjectRevenue.destroy({ where: { project_id } }),
      ProjectEmployees.destroy({ where: { project_id } }),
      StoreProject.destroy({ where: { project_id } }),
    ]);

    await Promise.all([
      EquipmentProject.bulkCreate(
        equipments.map((equipment_id) => ({ project_id, equipment_id }))
      ),
      ProjectRevenue.bulkCreate(
        revenueMaster.map((revenue_master_id) => ({ project_id, revenue_master_id }))
      ),
      ProjectEmployees.bulkCreate(
        staff.map((emp_id) => ({ project_id, emp_id }))
      ),
      StoreProject.bulkCreate(
        storeLocations.map((store_id) => ({ project_id, store_id }))
      ),
    ]);

    return res.status(200).json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("Error in updateProject:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// Delete Project
export const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Project_Master.findByPk(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Use transaction to ensure all deletions are atomic
    const transaction = await Project_Master.sequelize.transaction();
    try {
      // Delete all junction table entries first
      await Promise.all([
        EquipmentProject.destroy({ where: { project_id: id }, transaction }),
        ProjectRevenue.destroy({ where: { project_id: id }, transaction }),
        ProjectEmployees.destroy({ where: { project_id: id }, transaction }),
        StoreProject.destroy({ where: { project_id: id }, transaction }),
      ]);

      // Then delete the project itself
      await project.destroy({ transaction });

      await transaction.commit();
      return res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error deleting project:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
  }
};


//Bulk upload
// Controller to handle upload and processing
export const bulkUploadProjects = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (!rows.length) {
      return res.status(400).json({ message: "Excel sheet is empty" });
    }

    // Skip the first row (header)
    const dataRows = rows.slice(1);

    const results = [];

    for (const row of dataRows) {
      const [
        projectNo,
        customer,
        orderNo,
        contractStartDate,
        contractTenure,
        contractEndDate, // ✅ New field
        revenuemasterStr,
        equipmentsStr,
        staffStr,
        storelocationsStr,
      ] = row;

      if (!projectNo) continue;

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

      const result = await processProjectRow({
        projectNo,
        customer,
        orderNo,
        contractStartDate,
        contractTenure,
        contractEndDate, // ✅ Pass to processor
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
