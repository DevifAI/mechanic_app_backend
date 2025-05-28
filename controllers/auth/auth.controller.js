import bcrypt from "bcrypt";
import { models } from "../../models/index.js"; // Adjust path if needed

const { Employee, Role, Organisations } = models;

// ✅ LOGIN
export const login = async (req, res) => {
  const { emp_id, password } = req.body;

  if (!emp_id || !password) {
    return res
      .status(400)
      .json({ message: "emp_id and password are required" });
  }

  try {
    const employee = await Employee.findOne({ where: { emp_id } });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Fetch role and organisation separately
    const role = await Role.findOne({
      where: { id: employee.role_id },
      attributes: ["id", "name"], // or "name" if that's the correct field
    });

    const organisation = await Organisations.findOne({
      where: { id: employee.org_id },
      attributes: ["id", "org_name"],
    });

    return res.status(200).json({
      message: "Login successful",
      employee: {
        emp_id: employee.emp_id,
        emp_name: employee.emp_name,
        role: {
          id: role?.id,
          name: role?.name, // or role?.name
        },
        organisation: {
          id: organisation?.id,
          name: organisation?.org_name,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ CHANGE PASSWORD
// ✅ CHANGE PASSWORD
export const changePassword = async (req, res) => {
  const { emp_id, oldPassword, newPassword } = req.body;

  if (!emp_id || !oldPassword || !newPassword) {
    return res.status(400).json({ message: "emp_id, oldPassword, and newPassword are required" });
  }

  try {
    const employee = await Employee.findOne({ where: { emp_id } });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, employee.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    employee.password = hashedPassword;

    await employee.save();

    return res.status(200).json({ message: "Password changed successfully" });

  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
