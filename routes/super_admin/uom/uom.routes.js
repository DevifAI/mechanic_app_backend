import express from 'express';
import {
  createOrganisation,
  getOrganisations,
  getOrganisationById,
  updateOrganisation,
  deleteOrganisation,
} from '../../../controllers/organisations/organisation.controller.js'; // Adjust path
import { createUOM, deleteUOM, getUOMById, getUOMs, updateUOM } from '../../../controllers/uom/uom.controller.js';

const router = express.Router();

router.post('/', createUOM);
router.get('/', getUOMs);
router.get('/:id', getUOMById);
router.post('/:id', updateUOM);
router.delete('/:id', deleteUOM);

export default router;
