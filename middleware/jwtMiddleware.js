import jwt from "jsonwebtoken";
import { models } from "../models/index.js"; // Adjust path if needed
const { Employee } = models;
const jwtMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Unauthorized - No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Extract emp_id
    const { emp_id } = decoded;

    if (!emp_id) {
      return res
        .status(401)
        .json({ message: "Unauthorized - Invalid token payload" });
    }

    // Find employee by emp_id
    const employee = await Employee.findOne({ emp_id });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Compare stored active_jwt_token with the current token
    if (employee.active_jwt_token !== token) {
      return res.status(401).json({ message: "Unauthorized - Token mismatch" });
    }

    // Attach user to request
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Middleware Error:", err);
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

export default jwtMiddleware;
