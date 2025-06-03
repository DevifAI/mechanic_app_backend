import { models } from "../../models/index.js";
const {
  DieselRequisitions,
  DieselRequisitionItems,
  ConsumableItem,
  UOM,
  OEM,
  Employee,
  Organisations,
} = models;

export const getAllDieselRequisitions = async (req, res) => {
  try {
    const requisitions = await DieselRequisitions.findAll({
      include: [
        {
          model: DieselRequisitionItems,
          as: "items",
          include: [
            {
              model: ConsumableItem,
              as: "consumableItem",
              attributes: ["id", "item_name", "item_description"],
            },
            {
              model: UOM,
              as: "unitOfMeasurement",
              attributes: ["id", "unit_name", "unit_code"],
            },
          ],
        },
        {
          model: Employee,
          as: "createdByEmployee",
          attributes: ["id", "emp_name"],
        },
        {
          model: Organisations,
          as: "organisation",
          attributes: ["id", "org_name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(requisitions);
  } catch (error) {
    console.error("Error retrieving diesel requisitions:", error);
    return res.status(500).json({
      message: "Failed to retrieve requisitions",
      error: error.message,
    });
  }
};
