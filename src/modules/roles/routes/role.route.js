import express from "express";
import {
  createRole,
  getRoles,
  getRoleBySlug,
  updateRole,
  deleteRole,
} from "../controllers/role.controller.js";
import { authMiddleware } from "../../../core/middleware/auth.middleware.js";
import { checkPermission } from "../../../core/utils/permission.utils.js";

const router = express.Router();

// Define role module routes
router.route("/create").post(authMiddleware, checkPermission("admin", "role", "add"), createRole);
router.route("/get-all").get(authMiddleware, checkPermission("admin", "role", "get"), getRoles);
router.route("/get/:slug").get(authMiddleware, checkPermission("admin", "role", "get"), getRoleBySlug);
router.route("/update/:slug").put(authMiddleware, checkPermission("admin", "role", "edit"), updateRole);
router.route("/delete/:slug").delete(authMiddleware, checkPermission("admin", "role", "delete"), deleteRole);

export default router;
