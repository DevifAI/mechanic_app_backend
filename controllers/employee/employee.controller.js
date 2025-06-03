import XLSX from "xlsx";
import { models } from "../../models/index.js";
const { Employee, Role, Shift, EmpPositionsModel, Organisations, Project_Master, ProjectEmployees } = models;

export const createEmployee = async (req, res) => {
  try {
    const {
      emp_id,
      emp_name,
      blood_group,
      age,
      adress,
      position,
      is_active,
      shiftcode,
      role_id,
      org_id, // ✅ Extract org_id from the request body
    } = req.body;


    // 1. Check if emp_id already exists
    const existingEmp = await Employee.findOne({ where: { emp_id } });
    if (existingEmp) {
      return res.status(400).json({ message: "Employee ID already exists" });
    }

    // 2. Check if role_id exists
    const roleExists = await Role.findByPk(role_id);
    if (!roleExists) {
      return res.status(400).json({ message: "Invalid role_id" });
    }

    // 3. Check if position exists
    const positionExists = await EmpPositionsModel.findByPk(position);
    if (!positionExists) {
      return res.status(400).json({ message: "Invalid position" });
    }

    // 4. Check if shiftcode exists
    const shiftExists = await Shift.findOne({ where: { shift_code: shiftcode } });
    if (!shiftExists) {
      return res.status(400).json({ message: "Invalid shiftcode" });
    }

    // 5. Create employee with emp_id as password
    const newEmployee = await Employee.create({
      emp_id,
      emp_name,
      blood_group,
      age,
      adress,
      position,
      is_active,
      shiftcode,
      role_id,
      org_id, // ✅ Include org_id here
      password: emp_id, // This will be hashed in beforeCreate hook
    });

    return res.status(201).json({
      message: "Employee created successfully",
    });
  } catch (error) {
    console.error("Error creating employee:", error.message);
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ message: error.errors.map((e) => e.message) });
    }
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
        {
          model: EmpPositionsModel,
          as: "employeePosition",
          attributes: ["designation"], // Only include the name from Position
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

    const employee = await Employee.findByPk(id);

    console.log("Employee found:", req.body);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    await employee.update(req.body);
    return res.status(200).json(employee);
  } catch (error) {
    console.error("Error updating employee:", error);
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

    await employee.destroy();
    return res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
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
    const { role_name } = req.params;

    // First get the role_id from the Role table
    const role = await Role.findOne({
      where: { name: role_name },
      attributes: ['id']
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Then find all employees with this role_id
    const employees = await Employee.findAll({
      where: { role_id: role.id },
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
      position: emp.employeePosition?.designation || "N/A",
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
        position: emp.employeePosition?.designation || "N/A",
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