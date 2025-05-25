import { models } from '../../../models/index.js'; // Adjust path if needed
const { Equipment, ConsumableItem, UOM, Employee, Organisations, ConsumptionSheet } = models; // Ensure these are correctly imported

// Create a new consumption sheet entry
export const createConsumptionSheet = async (req, res) => {
  const {
    date,
    equipment,
    createdBy,
    org_id,
    is_approved_mic = false,
    is_approved_sic = false,
    is_approved_pm = false,
    items = [],
  } = req.body;

  if (!items.length) {
    return res.status(400).json({ message: 'No items provided' });
  }

  try {
    const createdSheets = await Promise.all(
      items.map((item) =>
        ConsumptionSheet.create({
          date,
          equipment,
          createdBy,
          org_id,
          is_approved_mic,
          is_approved_sic,
          is_approved_pm,
          item: item.item,
          quantity: item.quantity,
          uom_id: item.uom_id,
          notes: item.notes || "",
          reading_meter_uom: item.reading_meter_uom || null,
          reading_meter_number: item.reading_meter_number || null,
        })
      )
    );

    return res.status(201).json({
      message: 'Consumption sheets created successfully',
      data: createdSheets,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to create consumption sheets',
      error: error.message,
    });
  }
};


// Get all entries with associations
export const getAllConsumptionSheets = async (req, res) => {
  try {
    const sheets = await ConsumptionSheet.findAll({
      include: [
        { model: Equipment, as: 'equipmentData' },
        { model: ConsumableItem, as: 'itemData' },
        { model: UOM, as: 'uomData' },
        { model: Employee, as: 'createdByUser' },
        { model: Organisations, as: 'organisation' },
      ],
    });
    return res.status(200).json(sheets);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve entries', error: error.message });
  }
};

// Get one entry by ID
export const getConsumptionSheetById = async (req, res) => {
  try {
    const sheet = await ConsumptionSheet.findByPk(req.params.id, {
      include: [
        { model: Equipment, as: 'equipmentData' },
        { model: ConsumableItem, as: 'itemData' },
        { model: UOM, as: 'uomData' },
        { model: UOM, as: 'readingMeterUOMData' },
        { model: Employee, as: 'createdByUser' },
        { model: Organisations, as: 'organisation' },
      ],
    });

    if (!sheet) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    return res.status(200).json(sheet);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve entry', error: error.message });
  }
};

// Update an entry
export const updateConsumptionSheet = async (req, res) => {
  try {
    const [updated] = await ConsumptionSheet.update(req.body, {
      where: { id: req.params.id },
    });

    if (!updated) {
      return res.status(404).json({ message: 'Entry not found or not updated' });
    }

    const updatedEntry = await ConsumptionSheet.findByPk(req.params.id);
    return res.status(200).json(updatedEntry);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update entry', error: error.message });
  }
};

// Delete an entry
export const deleteConsumptionSheet = async (req, res) => {
  try {
    const deleted = await ConsumptionSheet.destroy({
      where: { id: req.params.id },
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Entry not found or already deleted' });
    }

    return res.status(200).json({ message: 'Entry deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete entry', error: error.message });
  }
};
