import express from "express";
import {
  createLeaveProfile,
  getAllLeaveProfiles,
  getLeaveProfileBySlug,
  updateLeaveProfile,
  deleteLeaveProfile,
} from "../controllers/leaveProfile.controller.js";
import { authMiddleware } from "../../../core/middleware/auth.middleware.js";
import { checkPermission } from "../../../core/utils/permission.utils.js";

const router = express.Router();

router.route("/create").post(authMiddleware, checkPermission("admin", "leaveprofile", "add"), createLeaveProfile);
router.route("/get-all").get(authMiddleware, checkPermission("admin", "leaveprofile", "get"), getAllLeaveProfiles);
router.route("/get/:slug").get(authMiddleware, checkPermission("admin", "leaveprofile", "get"), getLeaveProfileBySlug);
router.route("/update/:slug").put(authMiddleware, checkPermission("admin", "leaveprofile", "edit"), updateLeaveProfile);
router.route("/delete/:slug").delete(authMiddleware, checkPermission("admin", "leaveprofile", "delete"), deleteLeaveProfile);

export default router;
