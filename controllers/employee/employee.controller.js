import XLSX from "xlsx";
import { models } from "../../models/index.js";
const { Employee, Role, Shift, EmpPositionsModel } = models;

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
    } = req.body;

    // 1. Check if emp_id already exists
    const existingEmp = await Employee.findOne({ where: { emp_id } });
    if (existingEmp) {
      return res.status(500).json({ message: "Employee ID already exists" });
    }

    // 2. Check if role_id exists
    const roleExists = await Role.findByPk(role_id);
    if (!roleExists) {
      return res.status(500).json({ message: "Invalid role_id" });
    }

    // 3. Check if position exists
    const positionExists = await EmpPositionsModel.findByPk(position);

    if (!positionExists) {
      return res.status(500).json({ message: "Invalid position" });
    }

    // 4. Check if shiftcode exists
    const shiftExists = await Shift.findOne({
      where: { shift_code: shiftcode },
    });
    if (!shiftExists) {
      return res.status(500).json({ message: "Invalid shiftcode" });
    }

    // 5. Create employee
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
    });

    return res.status(201).json(newEmployee);
  } catch (error) {
    console.error("Error creating employee:", error);
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

// Update Employee
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id);
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
    console.error("Error deleting employee:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const bulkUploadEmployees = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Read Excel file from buffer
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON with default empty values to avoid undefined
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
        position, // this is designation string
        shiftcode,
        role_name,
      } = row;

      // Basic validation
      if (!emp_id || !emp_name || !position || !shiftcode || !role_name) {
        errors.push({
          row: i + 2,
          message: "Missing required fields",
        });
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

      // Create employee
      const newEmployee = await Employee.create({
        emp_id: empIdStr,
        emp_name,
        blood_group,
        age,
        adress,
        position: positionRecord.id,
        is_active: true,
        shiftcode,
        role_id: role.id,
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
