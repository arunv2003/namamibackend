import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { authMiddleware } from "../../../core/middleware/auth.middleware.js";

const router = express.Router();

router.route("/stats").get(authMiddleware, getDashboardStats);

export default router;
