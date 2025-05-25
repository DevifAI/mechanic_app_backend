import express from 'express';
import {
  createAccountGroup,
  getAllAccountGroups,
  getAccountGroupById,
  updateAccountGroup,
  deleteAccountGroup
} from '../../../controllers/accountGroup/account_group.controller.js';

const router = express.Router();

router.post('/', createAccountGroup);
router.get('/', getAllAccountGroups);
router.get('/:id', getAccountGroupById);
router.put('/:id', updateAccountGroup);
router.delete('/:id', deleteAccountGroup);

export default router;
