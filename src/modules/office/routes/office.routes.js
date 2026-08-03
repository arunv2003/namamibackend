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
router.route("/create").post(authMiddleware, checkPermission("admin", "department", "add"), createOffice);
router.route("/get-all").get(authMiddleware, checkPermission("admin", "department", "get"), getOffices);

router.route("/get/:slug").get(authMiddleware, checkPermission("admin", "department", "get"), getOfficeBySlug);
router.route("/update/:slug").put(authMiddleware, checkPermission("admin", "department", "edit"), updateOffice);
router.route("/delete/:slug").delete(authMiddleware, checkPermission("admin", "department", "delete"), deleteOffice);

export default router;
