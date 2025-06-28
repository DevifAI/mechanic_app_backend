import bcrypt from "bcrypt";
import { models } from "../../models/index.js"; // Adjust path if needed
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
const { Employee, Role, Organisations } = models;

// ✅ LOGIN

dotenv.config();

export const login = async (req, res) => {
  const { emp_id, password, forceLogoutAll = false } = req.body;

  if (!emp_id || !password) {
    return res
      .status(400)
      .json({ message: "emp_id and password are required" });
  }

  try {
    const employee = await Employee.findOne({ where: { emp_id } });

    if (!employee) {
      console.log("Employee not found for emp_id:", emp_id);
      return res.status(404).json({ message: "Employee not found" });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Check for existing session
    if (
      employee.active_jwt_token &&
      !forceLogoutAll
    ) {
      return res.status(403).json({
        message: "User already logged in on another device. Force logout?",
        promptForceLogout: true,
      });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: employee.id,
        emp_id: employee.emp_id,
        role: employee.app_access_role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Save active token
    employee.active_jwt_token = token;
    await employee.save();

    // Fetch organisation info
    const organisation = await Organisations.findOne({
      where: { id: employee.org_id },
      attributes: ["id", "org_name"],
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      employee: {
        id: employee.id,
        emp_id: employee.emp_id,
        emp_name: employee.emp_name,
        role: employee.app_access_role,
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
    return res
      .status(400)
      .json({ message: "emp_id, oldPassword, and newPassword are required" });
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

export const logout = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: "Invalid user session" });
    }

    await Employee.update(
      { active_jwt_token: null },
      { where: { id: userId } }
    );

    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
