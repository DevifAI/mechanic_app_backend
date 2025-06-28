import jwt from "jsonwebtoken";
import { models } from "../models/index.js";
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { emp_id } = decoded;
    console.log({ emp_id });
    if (!emp_id) {
      return res
        .status(401)
        .json({ message: "Unauthorized - Invalid token payload" });
    }

    const employee = await Employee.findOne({ where: { emp_id } });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    console.log({ employee });
    console.log(employee.active_jwt_token);
    console.log(token);

    if (employee.active_jwt_token !== token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - Token mismatch" });
    }

    // Token is valid and matches DB
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Middleware Error:", err);
    return res.status(401).json({ message: "Unauthorized - Invalid token0" });
  }
};

export default jwtMiddleware;
