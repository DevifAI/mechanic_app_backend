import XLSX from "xlsx";
import { models } from "../../models/index.js";
import bcrypt from "bcrypt";
const { Employee, Role, Shift, EmpPositionsModel, Organisations, Project_Master, ProjectEmployees, DieselReceipt, DieselRequisitions, ConsumptionSheet, MaintenanceSheet } = models;


export const createEmployee = async (req, res) => {
  try {
    const {
      emp_id,
      emp_name,
      blood_group,
      age,
      adress,
      state,
      city,
      pincode,
      is_active,
      shiftcode,
      role_id,
      org_id,
      app_access_role,
      acc_holder_name,
      bank_name,
      acc_no,
      ifsc_code,
    } = req.body;

    const existingEmp = await Employee.findOne({ where: { emp_id } });
    if (existingEmp) {
      return res.status(400).json({ message: "Employee ID already exists" });
    }

    const roleExists = await Role.findByPk(role_id);
    if (!roleExists) return res.status(400).json({ message: "Invalid role_id" });

    const shiftExists = await Shift.findOne({ where: { shift_code: shiftcode } });
    if (!shiftExists) return res.status(400).json({ message: "Invalid shiftcode" });

    const orgExists = await Organisations.findByPk(org_id);
    if (!orgExists) return res.status(400).json({ message: "Invalid organisation ID" });

    const validRoles = [
      'mechanic',
      'mechanicIncharge',
      'siteIncharge',
      'storeManager',
      'accountManager',
      'projectManager',
      'admin',
    ];
    if (!validRoles.includes(app_access_role)) {
      return res.status(400).json({ message: "Invalid app_access_role" });
    }

    const newEmployee = await Employee.create({
      emp_id,
      emp_name,
      blood_group,
      age,
      adress,
      state,
      city,
      pincode,
      is_active,
      shiftcode,
      role_id,
      org_id,
      app_access_role,
      password: emp_id, // Password will be hashed in the model hook
      acc_holder_name,
      bank_name,
      acc_no,
      ifsc_code,
    });

    return res.status(201).json({
      message: "Employee created successfully",
      employee: {
        id: newEmployee.id,
        emp_id: newEmployee.emp_id,
        emp_name: newEmployee.emp_name,
        app_access_role: newEmployee.app_access_role,
        state: newEmployee.state,
        city: newEmployee.city,
        pincode: newEmployee.pincode,
        acc_holder_name: newEmployee.acc_holder_name,
        bank_name: newEmployee.bank_name,
        acc_no: newEmployee.acc_no,
        ifsc_code: newEmployee.ifsc_code,
      },
    });
  } catch (error) {
    console.error("Error creating employee:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// Get All Employees
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["name"], // Only include the name from Role
        },
      ],
    });

    const formattedEmployees = employees.map((emp) => ({
      id: emp.id,
      emp_id: emp.emp_id,
      emp_name: emp.emp_name,
      blood_group: emp.blood_group,
      age: emp.age,
      address: emp.adress,
      position: emp.employeePosition?.name || "N/A",
      shiftcode: emp.shiftcode,
      role: emp.role?.name || "N/A",
      active: emp.is_active ? "Yes" : "No",
      app_access_role: emp.app_access_role || "N/A", // Include app_access_role
      state: emp.state || "N/A", // Include app_access_role
      city: emp.city || "N/A", // Include app_access_role
      pincode: emp.pincode || "N/A", // Include app_access_role
      bank_name: emp.bank_name || "N/A", // Include bank_name
      acc_holder_name: emp.acc_holder_name || "N/A", // Include acc_holder_name
      acc_no: emp.acc_no || "N/A", // Include acc_no
      ifsc_code: emp.ifsc_code || "N/A", // Include ifsc_code
    }));

    return res.status(200).json(formattedEmployees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Employee by ID
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json(employee);
  } catch (error) {
    console.error("Error fetching employee by ID:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};




export const getProjectsByEmployeeId = async (req, res) => {
  try {
    const { id: emp_id } = req.params;

    // Step 1: Find all project IDs assigned to the employee
    const projectLinks = await ProjectEmployees.findAll({
      where: { emp_id },
      attributes: ["project_id"],
    });

    if (!projectLinks || projectLinks.length === 0) {
      return res.status(404).json({ message: "No projects found for this employee" });
    }

    // Step 2: Extract project IDs
    const projectIds = projectLinks.map((link) => link.project_id);

    // Step 3: Find all projects using those IDs
    const projects = await Project_Master.findAll({
      where: {
        id: projectIds,
      },
    });

    return res.status(200).json({ projects });
  } catch (error) {
    console.error("Error fetching projects by employee ID:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Employee
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      emp_id,
      emp_name,
      blood_group,
      age,
      adress,
      state,
      city,
      pincode,
      is_active,
      shiftcode,
      role_id,
      org_id,
      app_access_role,
      password,
      acc_holder_name,
      bank_name,
      acc_no,
      ifsc_code,
    } = req.body;

    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Check for emp_id uniqueness if changed
    if (emp_id && emp_id !== employee.emp_id) {
      const existingEmp = await Employee.findOne({ where: { emp_id } });
      if (existingEmp) {
        return res.status(400).json({ message: "Employee ID already exists" });
      }
    }

    // Validate role_id if provided
    if (role_id) {
      const roleExists = await Role.findByPk(role_id);
      if (!roleExists) {
        return res.status(400).json({ message: "Invalid role_id" });
      }
    }

    // Validate shiftcode if provided
    if (shiftcode) {
      const shiftExists = await Shift.findOne({ where: { shift_code: shiftcode } });
      if (!shiftExists) {
        return res.status(400).json({ message: "Invalid shiftcode" });
      }
    }

    // Validate organisation ID if provided
    if (org_id) {
      const orgExists = await Organisations.findByPk(org_id);
      if (!orgExists) {
        return res.status(400).json({ message: "Invalid organisation ID" });
      }
    }

    // Validate app_access_role
    if (app_access_role) {
      const validRoles = [
        "mechanic",
        "mechanicIncharge",
        "siteIncharge",
        "storeManager",
        "accountManager",
        "projectManager",
        "admin",
      ];
      if (!validRoles.includes(app_access_role)) {
        return res.status(400).json({ message: "Invalid app_access_role" });
      }
    }

    // Handle password change
    let newPassword = employee.password;
    if (password && password !== employee.password) {
      const salt = await bcrypt.genSalt(10);
      newPassword = await bcrypt.hash(password, salt);
    }

    // Prepare update data
    const updateData = {
      emp_id: emp_id || employee.emp_id,
      emp_name: emp_name || employee.emp_name,
      blood_group: blood_group || employee.blood_group,
      age: age || employee.age,
      adress: adress || employee.adress,
      state: state || employee.state,
      city: city || employee.city,
      pincode: pincode || employee.pincode,
      is_active: is_active !== undefined ? is_active : employee.is_active,
      shiftcode: shiftcode || employee.shiftcode,
      role_id: role_id || employee.role_id,
      org_id: org_id || employee.org_id,
      app_access_role: app_access_role || employee.app_access_role,
      password: newPassword,

      acc_holder_name: acc_holder_name || employee.acc_holder_name,
      bank_name: bank_name || employee.bank_name,
      acc_no: acc_no || employee.acc_no,
      ifsc_code: ifsc_code || employee.ifsc_code,
    };

    await employee.update(updateData);

    return res.status(200).json({
      message: "Employee updated successfully",
      employee: {
        id: employee.id,
        emp_id: employee.emp_id,
        emp_name: employee.emp_name,
        app_access_role: employee.app_access_role,
        state: employee.state,
        city: employee.city,
        pincode: employee.pincode,
        acc_holder_name: employee.acc_holder_name,
        bank_name: employee.bank_name,
        acc_no: employee.acc_no,
        ifsc_code: employee.ifsc_code,
      },
    });
  } catch (error) {
    console.error("Error updating employee:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// Delete Employee
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Delete associated records first
    await Promise.all([
      ProjectEmployees.destroy({ where: { emp_id: id } }), // Use employee's UUID id, not emp_id
      DieselRequisitions.destroy({ where: { createdBy: id } }),
      DieselReceipt.destroy({ where: { createdBy: id } }),
      ConsumptionSheet.destroy({ where: { createdBy: id } }),
      MaintenanceSheet.destroy({ where: { createdBy: id } }),
      // Add more association deletions as needed
    ]);

    // Delete the employee
    await employee.destroy();

    return res.status(200).json({ message: "Employee and associations deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message // Include error details for debugging
    });
  }
};

export const bulkUploadEmployees = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (!rows.length) {
      return res.status(400).json({ message: "Excel sheet is empty" });
    }

    const errors = [];
    const createdEmployees = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const {
        emp_id,
        emp_name,
        blood_group,
        age,
        adress,
        position,       // designation string
        shiftcode,
        role_name,
        organisation,   // org_name in Excel
      } = row;

      // Validate required fields
      if (!emp_id || !emp_name || !position || !shiftcode || !role_name || !organisation) {
        errors.push({ row: i + 2, message: "Missing required fields" });
        continue;
      }

      const empIdStr = typeof emp_id === "string" ? emp_id.trim() : String(emp_id);

      const existingEmp = await Employee.findOne({ where: { emp_id: empIdStr } });
      if (existingEmp) {
        errors.push({ row: i + 2, message: `Employee ID ${empIdStr} already exists` });
        continue;
      }

      const role = await Role.findOne({ where: { name: role_name } });
      if (!role) {
        errors.push({ row: i + 2, message: `Invalid role_name: ${role_name}` });
        continue;
      }

      const positionRecord = await EmpPositionsModel.findOne({
        where: { designation: position },
      });
      if (!positionRecord) {
        errors.push({ row: i + 2, message: `Invalid position: ${position}` });
        continue;
      }

      const shift = await Shift.findOne({ where: { shift_code: shiftcode } });
      if (!shift) {
        errors.push({ row: i + 2, message: `Invalid shiftcode: ${shiftcode}` });
        continue;
      }

      const org = await Organisations.findOne({ where: { org_name: organisation } });
      if (!org) {
        errors.push({ row: i + 2, message: `Invalid organisation: ${organisation}` });
        continue;
      }

      // Create employee
      const newEmployee = await Employee.create({
        emp_id: empIdStr,
        emp_name,
        blood_group,
        age,
        adress,
        position: positionRecord.id,
        shiftcode,
        role_id: role.id,
        is_active: true,
        password: empIdStr, // will be hashed in beforeCreate
        org_id: org.id,
      });

      createdEmployees.push(newEmployee);
    }

    return res.status(201).json({
      message: "Bulk upload finished",
      createdCount: createdEmployees.length,
      errors,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Get Employees by Role
export const getEmployeesByRole = async (req, res) => {
  try {
    const { id } = req.params;



    // Then find all employees with this role_id
    const employees = await Employee.findAll({
      where: { role_id: id },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["name"],
        },
        {
          model: EmpPositionsModel,
          as: "employeePosition",
          attributes: ["designation"],
        },
      ],
    });

    // Format the response
    const formattedEmployees = employees.map((emp) => ({
      id: emp.id,
      emp_id: emp.emp_id,
      emp_name: emp.emp_name,
      blood_group: emp.blood_group,
      age: emp.age,
      address: emp.adress,
    
      shiftcode: emp.shiftcode,
      role: emp.role?.name || "N/A",
      active: emp.is_active ? "Yes" : "No",
    }));

    return res.status(200).json(formattedEmployees);
  } catch (error) {
    console.error("Error fetching employees by role:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Employees Grouped by Role
export const getAllEmployeesGroupedByRole = async (req, res) => {
  try {
    // First get all roles
    const roles = await Role.findAll({
      attributes: ['id', 'name'],
    });

    // Then get all employees with their role information
    const employees = await Employee.findAll({
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["name"],
        },
        {
          model: EmpPositionsModel,
          as: "employeePosition",
          attributes: ["designation"],
        },
      ],
    });

    // Format the response and group by role
    const result = {};

    // Initialize empty arrays for each role
    roles.forEach(role => {
      result[role.name] = [];
    });

    // Group employees by role
    employees.forEach(emp => {
      const roleName = emp.role?.name || 'Unknown';
      if (!result[roleName]) {
        result[roleName] = [];
      }

      result[roleName].push({
        id: emp.id,
        emp_id: emp.emp_id,
        emp_name: emp.emp_name,
        blood_group: emp.blood_group,
        age: emp.age,
        address: emp.adress,
      
        shiftcode: emp.shiftcode,
        active: emp.is_active ? "Yes" : "No",
      });
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching employees grouped by role:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};







export const addEmployeesToProject = async (req, res) => {
  try {
    const { project_id, employee_ids } = req.body;

    if (!project_id || !Array.isArray(employee_ids) || employee_ids.length === 0) {
      return res.status(400).json({ message: "project_id and employee_ids are required." });
    }

    // Check if project exists
    const projectExists = await Project_Master.findByPk(project_id);
    if (!projectExists) {
      return res.status(404).json({ message: "Project not found." });
    }

    // Validate employee IDs
    const foundEmployees = await Employee.findAll({
      where: { id: employee_ids },
    });

    if (foundEmployees.length !== employee_ids.length) {
      return res.status(400).json({ message: "Some employee IDs are invalid." });
    }

    // Find existing employee mappings for the project
    const existingMappings = await ProjectEmployees.findAll({
      where: {
        project_id,
        emp_id: employee_ids,
      },
    });

    const alreadyAssignedEmpIds = new Set(existingMappings.map(e => e.emp_id));

    // Filter out already assigned employees
    const newEmployeeIds = employee_ids.filter(emp_id => !alreadyAssignedEmpIds.has(emp_id));

    if (newEmployeeIds.length === 0) {
      return res.status(200).json({ message: "All selected employees are already assigned to this project." });
    }

    const newMappings = newEmployeeIds.map(emp_id => ({
      project_id,
      emp_id,
    }));

    await ProjectEmployees.bulkCreate(newMappings);

    return res.status(201).json({
      message: `Successfully added ${newMappings.length} employee(s) to the project.`,
    });
  } catch (error) {
    console.error("Error adding employees to project:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
