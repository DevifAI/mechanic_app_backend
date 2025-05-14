import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();
const sequelize = new Sequelize(
  process.env.DB_NAME, // master_db
  process.env.DB_USER, // postgres
  process.env.DB_PASSWORD, // 1998@Subho
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
  }
);

const connection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
};

export { sequelize, connection };
