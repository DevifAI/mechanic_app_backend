import express from 'express';
import {
  createOrganisation,
  getOrganisations,
  getOrganisationById,
  updateOrganisation,
  deleteOrganisation,
} from '../../../controllers/organisations/organisation.controller.js'; // Adjust path

const router = express.Router();

router.post('/', createOrganisation);
router.get('/', getOrganisations);
router.get('/:id', getOrganisationById);
router.post('/:id', updateOrganisation);
router.delete('/:id', deleteOrganisation);

export default router;
