import express from "express";
import {
  createOffice,
  getOffices,
  getOfficeBySlug,
  updateOffice,
  deleteOffice,
} from "../controllers/office.controller.js";
import { authMiddleware, isAdmin } from "../../../core/middleware/auth.middleware.js";

const router = express.Router();

// Define office module routes
router.route("/create").post(authMiddleware, isAdmin, createOffice);
router.route("/get-all").get(authMiddleware, getOffices);

router.route("/get/:slug").get(authMiddleware, getOfficeBySlug);
router.route("/update/:slug").put(authMiddleware, isAdmin, updateOffice);
router.route("/delete/:slug").delete(authMiddleware, isAdmin, deleteOffice);

export default router;
