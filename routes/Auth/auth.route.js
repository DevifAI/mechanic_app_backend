//create auth route here
import express from 'express'
import { changePassword, login } from '../../controllers/auth/auth.controller.js';




const router = express.Router();

router.post('/login', login);
router.post('/change/pass', changePassword);


export default router;
