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
    const employees = await Employee.findAll();
    return res.status(200).json(employees);
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
