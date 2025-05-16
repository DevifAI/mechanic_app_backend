import { sequelize } from "../config/postgres.js"; // Named import
import JobMasterModel from "./job_master.model.js";
import PartnerModel from "./partner.model.js"; // Import the Partner model
import ProjectMasterModel from "./project_master.model.js";
import RevenueMasterModel from "./revenue.model.js";
import ShiftModel from "./shift.model.js";
import StoreModel from "./store.model.js";
import EquipmentGroupModel from "./equipment_group.model.js";
import EquipmentModel from "./equipment.model.js";
import RoleModel from "./roles.model.js";
import EmpPositions from "./emp_position.model.js";
import EmployeeModel from "./employees.model.js";
import EquipProjectModel from "./junctionTable/EquipmentProject.js";

// Initialize models
const Partner = PartnerModel(sequelize); // Pass the sequelize instance to the model
const Project_Master = ProjectMasterModel(sequelize); // Pass the sequelize instance to the model
const RevenueMaster = RevenueMasterModel(sequelize);
const JobMaster = JobMasterModel(sequelize);
const Shift = ShiftModel(sequelize);
const Store = StoreModel(sequelize);
const EquipmentGroup = EquipmentGroupModel(sequelize);
const Equipment = EquipmentModel(sequelize);
const Role = RoleModel(sequelize);
const EmpPositionsModel = EmpPositions(sequelize);
const Employee = EmployeeModel(sequelize);
const EquipmentProject = EquipProjectModel(sequelize);
const models = {
  Partner,
  Project_Master,
  RevenueMaster,
  JobMaster,
  Shift,
  Store,
  EquipmentGroup,
  Equipment,
  Role,
  EmpPositionsModel,
  Employee,
  EquipmentProject,
};

// Sync the models
const syncModels = async () => {
  try {
    await sequelize.sync({ alter: true }); // { force: true } for development
    console.log("✅ All models were synced.");
  } catch (err) {
    console.error("❌ Sync failed:", err);
  }
};

// Export models and syncModels function
export { models, syncModels };
