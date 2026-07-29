import express from "express";
import { completetaskandcreateagain, getCompleteBehalfFields } from "../controllers/completebehalf.employee.controller.js";
import { authMiddleware } from "../../../core/middleware/auth.middleware.js";

const router = express.Router();

router.route("/fields").get(authMiddleware, getCompleteBehalfFields);
router.route('/complete').post(authMiddleware,completetaskandcreateagain)
export default router;
