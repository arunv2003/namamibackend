import express from "express";
import {
  createOffice,
  getOffices,
  getOfficeBySlug,
  updateOffice,
  deleteOffice,
} from "../controllers/office.controller.js";
import { authMiddleware } from "../../../core/middleware/auth.middleware.js";
import { checkPermission } from "../../../core/utils/permission.utils.js";

const router = express.Router();

// Define office module routes
router.route("/create").post(authMiddleware, checkPermission("location", "branch", "add"), createOffice);
router.route("/get-all").get(authMiddleware, checkPermission("location", "branch", "get"), getOffices);

router.route("/get/:slug").get(authMiddleware, checkPermission("location", "branch", "get"), getOfficeBySlug);
router.route("/update/:slug").put(authMiddleware, checkPermission("location", "branch", "edit"), updateOffice);
router.route("/delete/:slug").delete(authMiddleware, checkPermission("location", "branch", "delete"), deleteOffice);

export default router;
