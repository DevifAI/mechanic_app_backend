import { Op } from "sequelize";
import { models } from "../../models/index.js";
const {
  Partner,
  Project_Master,
  RevenueMaster,
  Equipment,
  Employee,
  Store,
  EquipmentProject,
  ProjectEmployees,
  ProjectRevenue,
  StoreProject,
} = models;

export async function processProjectRow({
  projectNo,
  customer, // partner_name
  orderNo,
  contractStartDate,
  contractTenure,
  revenue_master_ids, // these are revenue_codes now
  equipment_allocated_ids, // these are equipment_names
  // staff_ids, // these are emp_names
  store_location_ids, // these are store_codes
}) {
  // Check duplicate project no
  const existingProject = await Project_Master.findOne({
    where: { project_no: projectNo },
  });
  if (existingProject) {
    return {
      projectNo,
      status: "failed",
      message: "Project number already exists.",
    };
  }

  // Find customer by partner_name
  console.log({ customer });
  const partner = await Partner.findOne({ where: { partner_name: customer } });
  if (!partner) {
    return { projectNo, status: "failed", message: "Invalid customer name" };
  }

  const customer_id = partner.id;
  console.log({ revenue_master_ids })
  // Find RevenueMaster by revenue_code
  const revenues = await RevenueMaster.findAll({
    where: { revenue_code: { [Op.in]: revenue_master_ids } },
  });
  console.log({ revenues });
  if (revenues.length !== revenue_master_ids.length) {
    return {
      projectNo,
      status: "failed",
      message: "One or more revenue codes are invalid.",
    };
  }
  const revenue_ids = revenues.map((r) => r.id);

  // Find Equipment by equipment_name
  const equipments = await Equipment.findAll({
    where: { equipment_name: { [Op.in]: equipment_allocated_ids } },
  });
  if (equipments.length !== equipment_allocated_ids.length) {
    return {
      projectNo,
      status: "failed",
      message: "One or more equipment names are invalid.",
    };
  }
  const equipment_ids = equipments.map((e) => e.id);

  // Find Employees by emp_name
  // const employees = await Employee.findAll({
  //   where: { emp_name: { [Op.in]: staff_ids } },
  // });
  // if (employees.length !== staff_ids.length) {
  //   return {
  //     projectNo,
  //     status: "failed",
  //     message: "One or more employee names are invalid.",
  //   };
  // }
  // const employee_ids = employees.map((e) => e.id);

  // Find Stores by store_code
  const stores = await Store.findAll({
    where: { store_code: { [Op.in]: store_location_ids } },
  });
  if (stores.length !== store_location_ids.length) {
    return {
      projectNo,
      status: "failed",
      message: "One or more store codes are invalid.",
    };
  }
  const store_ids = stores.map((s) => s.id);

  // Create project
  const project = await Project_Master.create({
    project_no: projectNo,
    customer_id,
    order_no: orderNo,
    contract_start_date: contractStartDate,
    contract_tenure: contractTenure,
  });

  const project_id = project.id;

  // Insert associated records
  if (equipment_ids.length > 0) {
    await EquipmentProject.bulkCreate(
      equipment_ids.map((id) => ({ project_id, equipment_id: id }))
    );
  }

  if (revenue_ids.length > 0) {
    await ProjectRevenue.bulkCreate(
      revenue_ids.map((id) => ({ project_id, revenue_master_id: id }))
    );
  }

  // if (employee_ids.length > 0) {
  //   await ProjectEmployees.bulkCreate(
  //     employee_ids.map((id) => ({ project_id, emp_id: id }))
  //   );
  // }

  if (store_ids.length > 0) {
    await StoreProject.bulkCreate(
      store_ids.map((id) => ({ project_id, store_id: id }))
    );
  }

  return { projectNo, status: "success", message: "Created successfully" };
}
