import express from 'express';
import { createMaterialTransaction, deleteAllMaterialTransactions, deleteMaterialTransaction, getAllMaterialTransactions, getMaterialTransactionById, updateMaterialTransaction } from '../../controllers/StoreManager/storeManager.material.controller.js';
import { createEquipmentTransaction, deleteEquipmentTransaction, getAllEquipmentTransactions, getEquipmentTransactionById, updateEquipmentTransaction } from '../../controllers/StoreManager/storeManager.equipment.controller.js';



const router = express.Router();

// Create a new Material Transaction
router.post('/', createMaterialTransaction);

// Get all Material Transactions
router.post('/get/transactions', getAllMaterialTransactions);

// Get a single Material Transaction by ID
router.get('/:id', getMaterialTransactionById);

// Update a Material Transaction by ID
router.put('/:id', updateMaterialTransaction);

// Delete a Material Transaction by ID
router.delete('/:id', deleteMaterialTransaction);
router.delete('/material-transaction', deleteAllMaterialTransactions);



router.post("/equipment", createEquipmentTransaction);
router.post("/get/equipment", getAllEquipmentTransactions);
router.get("/equipment/:id", getEquipmentTransactionById);
router.put("/equipment/:id", updateEquipmentTransaction);
router.delete("/equipment/:id", deleteEquipmentTransaction);

export default router;

