import { models } from "../../models/index.js"; // Correct import
const { Partner } = models; // Extract Partner model

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
    isCustomer,
  } = req.body;

  if (
    !partner_name ||
    !partner_address ||
    !partner_gst ||
    !partner_geo_id ||
    !isCustomer
  ) {
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
