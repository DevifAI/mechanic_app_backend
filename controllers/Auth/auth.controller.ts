import bcrypt from "bcrypt";
import { models } from '../../models/index.js'; // Adjust path if needed

const { Employee } = models;

// ✅ LOGIN
export const login = async (req, res) => {
  const { emp_id, password } = req.body;

  if (!emp_id || !password) {
    return res.status(400).json({ message: "emp_id and password are required" });
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

    return res.status(200).json({
      message: "Login successful",
      employee: {
        emp_id: employee.emp_id,
        emp_name: employee.emp_name,
        role_id: employee.role_id,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};




// ✅ CHANGE PASSWORD
export const changePassword = async (req, res) => {
  const { emp_id, resetCode, oldPassword, newPassword } = req.body;

  if (!emp_id || !newPassword) {
    return res.status(400).json({ message: "emp_id and newPassword are required" });
  }

  try {
    const employee = await Employee.findOne({ where: { emp_id } });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (resetCode) {
      // Forgot password flow
      if (
        !employee.resetCode ||
        employee.resetCode !== resetCode ||
        !employee.resetCodeExpiry ||
        employee.resetCodeExpiry < new Date()
      ) {
        return res.status(400).json({ message: "Invalid or expired reset code" });
      }
    } else if (oldPassword) {
      // Normal password change flow
      const isMatch = await bcrypt.compare(oldPassword, employee.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Old password is incorrect" });
      }
    } else {
      return res.status(400).json({ message: "Provide either resetCode or oldPassword" });
    }

    // Update password - assume password hashing happens in model hooks
    employee.password = newPassword;

    // Clear reset code and expiry if used
    employee.resetCode = null;
    employee.resetCodeExpiry = null;

    await employee.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
