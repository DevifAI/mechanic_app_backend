import { models } from "../../models/index.js"; // Correct import
const { Partner } = models; // Extract Partner model
import XLSX from "xlsx";

// Create Partner
export const createPartner = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "Request body is missing" });
  }
  // Check if the required fields are in the request body
  const {
    partner_name,
    partner_address,
    partner_gst,
    partner_geo_id,
  } = req.body;

  if (
    partner_name === undefined ||
    partner_address === undefined ||
    partner_gst === undefined ||
    partner_geo_id === undefined
  ) {
    console.log({ partner_address });
    console.log({ partner_geo_id });
    console.log({ partner_name, partner_gst });
    return res.status(400).json({ message: "Missing required fields" });
  }


  try {
    const partner = await Partner.create(req.body); // Create the partner instance
    return res.status(201).json(partner);
  } catch (error) {
    console.error("Error creating partner:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all Partners
export const getPartners = async (req, res) => {
  try {
    const partners = await Partner.findAll(); // Find all partners
    return res.status(200).json(partners);
  } catch (error) {
    console.error("Error fetching partners:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getPartnerById = async (req, res) => {
  const { id } = req.params;

  try {
    const partner = await Partner.findByPk(id);
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }
    return res.status(200).json(partner);
  } catch (error) {
    console.error("Error fetching partner:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updatePartner = async (req, res) => {
  const { id } = req.params;
  const {
    partner_name,
    partner_address,
    partner_gst,
    partner_geo_id,
    isCustomer,
  } = req.body;

  try {
    const partner = await Partner.findByPk(id);
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    await partner.update({
      partner_name,
      partner_address,
      partner_gst,
      partner_geo_id,
      isCustomer,
    });

    return res.status(200).json(partner);
  } catch (error) {
    console.error("Error updating partner:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deletePartner = async (req, res) => {
  const { id } = req.params;

  try {
    const partner = await Partner.findByPk(id);
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    await partner.destroy();

    return res.status(200).json({ message: "Partner deleted successfully" });
  } catch (error) {
    console.error("Error deleting partner:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};




export const bulkUploadPartners = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Parse uploaded Excel file buffer
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON with header row keys
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    // defval: "" ensures missing cells become empty strings instead of undefined

    if (!rows.length) {
      return res.status(400).json({ message: "Excel sheet is empty" });
    }

    const results = [];
    for (const [index, row] of rows.entries()) {
      const {
        partner_name,
        partner_address,
        partner_gst,
        partner_geo_id,
      } = row;

  // Validate required fields per row
      if (
        partner_name === undefined ||
        partner_address === undefined ||
        partner_gst === undefined ||
        partner_geo_id === undefined
      ) {
        results.push({
          row: index + 2, // +2 to account for header row and 0-based index
          status: "failed",
          message: "Missing required fields",
        });
        continue; // skip this row
      }
    


      try {
        // Create partner record
        const partner = await Partner.create({
          partner_name,
          partner_address,
          partner_gst,
          partner_geo_id,
        });

        results.push({
          row: index + 2,
          status: "success",
          partnerId: partner.id,
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
    console.error("Bulk upload partners error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

