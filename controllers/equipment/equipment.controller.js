import { models } from "../../models/index.js";
const { Equipment, EquipmentGroup, EquipmentProject } = models;

// Create Equipment
export const createEquipment = async (req, res) => {
  const {
    equipment_name,
    equipment_sr_no,
    additional_id,
    purchase_date,
    oem,
    purchase_cost,
    equipment_manual,
    maintenance_log,
    other_log,
    project_tag,
    equipment_group_id,
  } = req.body;

  try {
    // Validate required fields
    if (
      !equipment_name ||
      !equipment_sr_no ||
      !purchase_date ||
      !oem ||
      !equipment_group_id
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if the equipment_group_id exists
    const groupExists = await EquipmentGroup.findByPk(equipment_group_id);
    if (!groupExists) {
      return res.status(404).json({ message: "Equipment group not found" });
    }

    const newEquipment = await Equipment.create({
      equipment_name,
      equipment_sr_no,
      additional_id,
      purchase_date,
      oem,
      purchase_cost,
      equipment_manual,
      maintenance_log,
      other_log,
      project_tag,
      equipment_group_id,
    });

    return res.status(201).json(newEquipment);
  } catch (error) {
    console.error("Error creating equipment:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Equipment
export const getAllEquipment = async (req, res) => {
  try {
    // const equipments = await Equipment.findAll({
    //   include: [{ model: EquipmentGroup, as: "equipment_group" }]
    // });
    const equipments = await Equipment.findAll();
    return res.status(200).json(equipments);
  } catch (error) {
    console.error("Error fetching equipment:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Equipment by ID
export const getEquipmentById = async (req, res) => {
  const { id } = req.params;

  try {
    // const equipment = await Equipment.findByPk(id, {
    //   include: [{ model: EquipmentGroup, as: "equipment_group" }]
    // });
    const equipment = await Equipment.findByPk(id);

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    return res.status(200).json(equipment);
  } catch (error) {
    console.error("Error fetching equipment:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Equipment
export const updateEquipment = async (req, res) => {
  const { id } = req.params;
  const {
    equipment_name,
    equipment_sr_no,
    additional_id,
    purchase_date,
    oem,
    purchase_cost,
    equipment_manual,
    maintenance_log,
    other_log,
    project_tag,
    equipment_group_id,
  } = req.body;

  try {
    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    // If updating group, check existence
    if (equipment_group_id) {
      const groupExists = await EquipmentGroup.findByPk(equipment_group_id);
      if (!groupExists) {
        return res.status(404).json({ message: "Equipment group not found" });
      }
    }

    await equipment.update({
      equipment_name,
      equipment_sr_no,
      additional_id,
      purchase_date,
      oem,
      purchase_cost,
      equipment_manual,
      maintenance_log,
      other_log,
      project_tag,
      equipment_group_id,
    });

    return res.status(200).json(equipment);
  } catch (error) {
    console.error("Error updating equipment:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Equipment
export const deleteEquipment = async (req, res) => {
  const { id } = req.params;

  try {
    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    // Remove all references from EquipmentProject first
    await EquipmentProject.destroy({ where: { equipment_id: id } });

    await equipment.destroy();
    return res.status(200).json({ message: "Equipment deleted successfully" });
  } catch (error) {
    console.error("Error deleting equipment:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export const bulkUploadEquipment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Parse Excel file buffer
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON with header keys, empty cells as empty string
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (!rows.length) {
      return res.status(400).json({ message: "Excel sheet is empty" });
    }

    const results = [];

    for (const [index, row] of rows.entries()) {
      const {
        equipment_name,
        equipment_sr_no,
        additional_id,
        purchase_date,
        oem,
        purchase_cost,
        equipment_manual,
        maintenance_log,
        other_log,
        project_tag,
        equipment_group_id,
      } = row;

      // Validate required fields
      if (
        !equipment_name ||
        !equipment_sr_no ||
        !purchase_date ||
        !oem ||
        !equipment_group_id
      ) {
        results.push({
          row: index + 2,
          status: "failed",
          message: "Missing required fields",
        });
        continue;
      }

      // Check if equipment group exists
      const groupExists = await EquipmentGroup.findByPk(equipment_group_id);
      if (!groupExists) {
        results.push({
          row: index + 2,
          status: "failed",
          message: "Equipment group not found",
        });
        continue;
      }

      try {
        const newEquipment = await Equipment.create({
          equipment_name,
          equipment_sr_no,
          additional_id,
          purchase_date,
          oem,
          purchase_cost,
          equipment_manual,
          maintenance_log,
          other_log,
          project_tag,
          equipment_group_id,
        });

        results.push({
          row: index + 2,
          status: "success",
          equipmentId: newEquipment.id,
        });
      } catch (error) {
        results.push({
          row: index + 2,
          status: "failed",
          message: error.message,
        });
      }
    }

    return res.status(201).json({
      message: "Bulk upload completed",
      results,
    });
  } catch (error) {
    console.error("Bulk upload equipment error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};