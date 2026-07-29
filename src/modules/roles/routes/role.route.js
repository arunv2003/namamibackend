import express from "express";
import {
  createRole,
  getRoles,
  getRoleBySlug,
  updateRole,
  deleteRole,
} from "../controllers/role.controller.js";
import { authMiddleware, isAdmin } from "../../../core/middleware/auth.middleware.js";

const router = express.Router();

// Define role module routes
router.route("/create").post(authMiddleware, isAdmin, createRole);
router.route("/get-all").get(authMiddleware,getRoles);

router.route("/get/:slug").get(authMiddleware,getRoleBySlug);
router.route("/update/:slug").put(authMiddleware, isAdmin, updateRole);
router.route("/delete/:slug").delete(authMiddleware, isAdmin, deleteRole);

export default router;
