import { models } from '../../../models/index.js'; // Adjust path if needed
const {
  Equipment,
  ConsumableItem,
  UOM,
  Employee,
  Organisations,
  ConsumptionSheet,
  ConsumptionSheetItem,
} = models;

// ✅ CREATE
export const createConsumptionSheet = async (req, res) => {
  const {
    date,
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
    const sheet = await ConsumptionSheet.create({
      date,
      createdBy,
      org_id,
      is_approved_mic,
      is_approved_sic,
      is_approved_pm,
    });

    const itemPromises = items.map(item =>
      ConsumptionSheetItem.create({
        consumption_sheet_id: sheet.id,
        item: item.item,
        quantity: item.quantity,
        uom_id: item.uom_id,
        notes: item.notes || '',
        reading_meter_uom: item.reading_meter_uom || null,
        reading_meter_number: item.reading_meter_number || null,
      })
    );

    const createdItems = await Promise.all(itemPromises);

    return res.status(201).json({
      message: 'Consumption sheet created successfully',
      sheet,
      items: createdItems,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to create consumption sheet',
      error: error.message,
    });
  }
};

// ✅ READ ALL
export const getAllConsumptionSheets = async (req, res) => {
  try {
    const sheets = await ConsumptionSheet.findAll({
      include: [
        {
          model: ConsumptionSheetItem,
          as: 'items',
          include: [
            { model: ConsumableItem, as: 'itemData' },
            { model: UOM, as: 'uomData' },
          ],
        },
        { model: Employee, as: 'createdByUser' },
        { model: Organisations, as: 'organisation' },
      ],
    });
    return res.status(200).json(sheets);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve entries', error: error.message });
  }
};

// ✅ READ ONE
export const getConsumptionSheetById = async (req, res) => {
  try {
    const sheet = await ConsumptionSheet.findByPk(req.params.id, {
      include: [
        {
          model: ConsumptionSheetItem,
          as: 'items',
          include: [
            { model: ConsumableItem, as: 'itemData' },
            { model: UOM, as: 'uomData' },
          ],
        },
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

// ✅ UPDATE
export const updateConsumptionSheet = async (req, res) => {
  const { id } = req.params;
  const {
    date,
    createdBy,
    org_id,
    is_approved_mic,
    is_approved_sic,
    is_approved_pm,
    items = [],
  } = req.body;

  try {
    const sheet = await ConsumptionSheet.findByPk(id);
    if (!sheet) {
      return res.status(404).json({ message: 'Consumption sheet not found' });
    }

    await sheet.update({
      date,
      createdBy,
      org_id,
      is_approved_mic,
      is_approved_sic,
      is_approved_pm,
    });

    // Optional: Delete existing items and re-create (or do smart update if needed)
    await ConsumptionSheetItem.destroy({ where: { consumption_sheet_id: id } });

    const newItems = await Promise.all(
      items.map(item =>
        ConsumptionSheetItem.create({
          consumption_sheet_id: id,
          item: item.item,
          quantity: item.quantity,
          uom_id: item.uom_id,
          notes: item.notes || '',
          reading_meter_uom: item.reading_meter_uom || null,
          reading_meter_number: item.reading_meter_number || null,
        })
      )
    );

    return res.status(200).json({ message: 'Updated successfully', sheet, items: newItems });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update', error: error.message });
  }
};

// ✅ DELETE
export const deleteConsumptionSheet = async (req, res) => {
  const { id } = req.params;

  try {
    const sheet = await ConsumptionSheet.findByPk(id);
    if (!sheet) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    await ConsumptionSheetItem.destroy({ where: { consumption_sheet_id: id } });
    await sheet.destroy();

    return res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete', error: error.message });
  }
};
