import express from "express";
import { changePassword, login } from "../../controllers/auth/auth.controller.js";


const router = express.Router();

router.post("/", login);
router.post("/", changePassword);


export default router;
