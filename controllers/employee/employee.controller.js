import { models } from "../../models/index.js";
const { Employee, Role, Shift, EmpPositions } = models;

// Create Employee
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
