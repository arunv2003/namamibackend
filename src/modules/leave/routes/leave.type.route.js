import express from "express";
import {
  createLeaveType,
  getAllLeaveTypes,
  getLeaveTypeBySlug,
  updateLeaveType,
  deleteLeaveType,
} from "../controllers/leave.type.controller.js";
import { authMiddleware } from "../../../core/middleware/auth.middleware.js";
import { checkPermission } from "../../../core/utils/permission.utils.js";

const router = express.Router();

router.route("/create").post(authMiddleware, checkPermission("admin", "leaveType", "add"), createLeaveType);
router.route("/get-all").get(authMiddleware, checkPermission("admin", "leaveType", "get"), getAllLeaveTypes);
router.route("/get/:slug").get(authMiddleware, checkPermission("admin", "leaveType", "get"), getLeaveTypeBySlug);
router.route("/update/:slug").put(authMiddleware, checkPermission("admin", "leaveType", "edit"), updateLeaveType);
router.route("/delete/:slug").delete(authMiddleware, checkPermission("admin", "leaveType", "delete"), deleteLeaveType);

export default router;
