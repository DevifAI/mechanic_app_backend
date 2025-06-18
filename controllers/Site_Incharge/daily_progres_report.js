import { Op } from "sequelize";
import { models } from "../../models/index.js";

const {DailyProgressReport, DailyProgressReportForm} = models

export const createDailyProgressReport = async (req, res) => {
  try {
    const {
      date,
      dpr_no,
      project_id,
      customer_representative,
      shift_code,
      shift_incharge,
      shift_mechanic,
      forms = [],
    } = req.body;

    const report = await DailyProgressReport.create({
      date,
      dpr_no,
      project_id,
      customer_representative,
      shift_code,
      shift_incharge,
      shift_mechanic,
    });

    if (forms.length > 0) {
      const formRecords = forms.map((form) => ({
        ...form,
        dpr_id: report.id,
      }));
      await DailyProgressReportForm.bulkCreate(formRecords);
    }

    res.status(201).json({
      message: "DPR created successfully",
      reportId: report.id,
    });
  } catch (error) {
    console.error("Create DPR error:", error);
    res.status(500).json({ message: "Failed to create DPR", error });
  }
};

// Get all DPRs
export const getAllDailyProgressReports = async (req, res) => {
  try {
    const reports = await DailyProgressReport.findAll({
      include: [
        {
          model: DailyProgressReportForm,
          as: "forms",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(reports);
  } catch (error) {
    console.error("Get all DPRs error:", error);
    res.status(500).json({ message: "Failed to fetch DPRs", error });
  }
};

// Get single DPR by ID
export const getDailyProgressReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await DailyProgressReport.findByPk(id, {
      include: [
        {
          model: DailyProgressReportForm,
          as: "forms",
        },
      ],
    });

    if (!report) return res.status(404).json({ message: "DPR not found" });

    res.status(200).json(report);
  } catch (error) {
    console.error("Get DPR by ID error:", error);
    res.status(500).json({ message: "Failed to fetch DPR", error });
  }
};

// Update DPR with new forms
export const updateDailyProgressReport = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date,
      dpr_no,
      project_id,
      customer_representative,
      shift_code,
      shift_incharge,
      shift_mechanic,
      forms = [],
    } = req.body;

    const report = await DailyProgressReport.findByPk(id);
    if (!report) return res.status(404).json({ message: "DPR not found" });

    await report.update({
      date,
      dpr_no,
      project_id,
      customer_representative,
      shift_code,
      shift_incharge,
      shift_mechanic,
    });

    // Replace forms
    await DailyProgressReportForm.destroy({ where: { dpr_id: id } });

    if (forms.length > 0) {
      const formRecords = forms.map((form) => ({
        ...form,
        dpr_id: id,
      }));
      await DailyProgressReportForm.bulkCreate(formRecords);
    }

    res.status(200).json({ message: "DPR updated successfully" });
  } catch (error) {
    console.error("Update DPR error:", error);
    res.status(500).json({ message: "Failed to update DPR", error });
  }
};

// Delete DPR and its forms
export const deleteDailyProgressReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await DailyProgressReport.findByPk(id);
    if (!report) return res.status(404).json({ message: "DPR not found" });

    await DailyProgressReportForm.destroy({ where: { dpr_id: id } });
    await report.destroy();

    res.status(200).json({ message: "DPR deleted successfully" });
  } catch (error) {
    console.error("Delete DPR error:", error);
    res.status(500).json({ message: "Failed to delete DPR", error });
  }
};