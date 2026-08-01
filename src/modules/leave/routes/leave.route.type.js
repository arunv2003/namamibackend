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

router.route("/create").post(authMiddleware, checkPermission("leave", "leavetype", "add"), createLeaveType);
router.route("/get-all").get(authMiddleware, checkPermission("leave", "leavetype", "get"), getAllLeaveTypes);
router.route("/get/:slug").get(authMiddleware, checkPermission("leave", "leavetype", "get"), getLeaveTypeBySlug);
router.route("/update/:slug").put(authMiddleware, checkPermission("leave", "leavetype", "edit"), updateLeaveType);
router.route("/delete/:slug").delete(authMiddleware, checkPermission("leave", "leavetype", "delete"), deleteLeaveType);

export default router;
